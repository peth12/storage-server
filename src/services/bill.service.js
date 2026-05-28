import Bill from "../models/Bill.js";
import Product from "../models/Product.js";
import Transaction from "../models/Transaction.js";
import { generateBillNumber } from "../utils/billNumber.js";
import { deductProductLotsFIFO } from "./productLot.service.js";

const TAX = Number(process.env.TAX_RATE || 0.07);

export function computeTotals(items) {
  const subtotal = items.reduce((s, it) => s + it.quantity * it.price, 0);
  const tax = +(subtotal * TAX);
  const total = +(subtotal + tax);
  return { subtotal, tax, total };
}

export async function createBill({ items, status = "draft", createdBy }) {
  if (!items?.length) throw Object.assign(new Error("Bill must have items"), { status: 400 });

  const normalized = [];
  for (const it of items) {
    if (!it.productName || !it.price) {
      const p = await Product.findById(it.productId);
      if (!p) throw Object.assign(new Error("Product not found: " + it.productId), { status: 404 });
      normalized.push({
        productId: p._id.toString(),
        productName: p.name,
        quantity: it.quantity,
        price: p.price,
        total: p.price * it.quantity
      });
    } else {
      normalized.push({ ...it, total: it.price * it.quantity });
    }
  }

  const totals = computeTotals(normalized);
  const billDoc = await Bill.create({
    billNumber: generateBillNumber(),
    items: normalized,
    ...totals,
    status,
    createdBy
  });

  // apply stock + transactions only if completed
  if (status === "completed") {
    await applyBillStockEffects(billDoc, createdBy);
  }

  return billDoc;
}

export async function updateBillStatus(billId, nextStatus, actor) {
  const bill = await Bill.findById(billId);
  if (!bill) throw Object.assign(new Error("Bill not found"), { status: 404 });

  if (bill.status === "completed" && nextStatus === "draft")
    throw Object.assign(new Error("Cannot move completed bill back to draft"), { status: 400 });

  // complete -> void: (optional) restock (not implemented here), choose your policy
  if (bill.status === "draft" && nextStatus === "completed") {
    await applyBillStockEffects(bill, actor);
  }

  bill.status = nextStatus;
  await bill.save();
  return bill;
}

async function applyBillStockEffects(bill, actor) {
  // check stock sufficiency first
  for (const it of bill.items) {
    const p = await Product.findById(it.productId);
    if (!p) throw Object.assign(new Error("Product not found: " + it.productId), { status: 404 });
    if (p.quantity < it.quantity) {
      throw Object.assign(
        new Error(`Insufficient stock for ${p.name}. Have ${p.quantity}, need ${it.quantity}`),
        { status: 400 }
      );
    }
  }

  // deduct and create transactions
  for (const it of bill.items) {
    const p = await Product.findById(it.productId);
    const allocations = await deductProductLotsFIFO(it.productId, it.quantity, it.price);
    it.lotAllocations = allocations;
    it.totalCost = allocations.reduce((sum, allocation) => sum + allocation.costPerUnit * allocation.quantity, 0);
    it.totalProfit = allocations.reduce((sum, allocation) => sum + allocation.totalProfit, 0);

    await Transaction.create({
      productId: p._id.toString(),
      productName: p.name,
      type: "out",
      quantity: it.quantity,
      reason: `ขายตามบิล ${bill.billNumber}`,
      billId: bill._id.toString(),
      createdBy: actor
    });
  }

  bill.markModified("items");
  await bill.save();
}

export async function getBill(id) {
  return Bill.findById(id);
}

export async function listBills({ page = 1, limit = 20, status, q }) {
  const filter = {};
  if (status) filter.status = status;
  if (q) filter.billNumber = { $regex: q, $options: "i" };
  const [items, total] = await Promise.all([
    Bill.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
    Bill.countDocuments(filter)
  ]);
  return { items, total, page: Number(page), limit: Number(limit) };
}
