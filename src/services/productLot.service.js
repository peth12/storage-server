import Product from "../models/Product.js";
import ProductLot from "../models/ProductLot.js";

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function defaultReceivedDate(product) {
  return product?.createdAt ? product.createdAt.toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
}

function makeLotNumber(prefix = "LOT") {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function ensureInitialLot(productOrId) {
  const product = typeof productOrId === "string" ? await Product.findById(productOrId) : productOrId;
  if (!product) throw Object.assign(new Error("Product not found"), { status: 404 });

  const productId = product._id.toString();
  const existingLot = await ProductLot.findOne({ productId });
  if (existingLot || product.quantity <= 0) return product;

  await ProductLot.create({
    productId,
    lotNumber: "LOT-INITIAL",
    receivedDate: defaultReceivedDate(product),
    initialQuantity: product.quantity,
    remainingQuantity: product.quantity,
    costPerUnit: product.cost,
    salePrice: product.price,
    note: "ล็อตตั้งต้นจากข้อมูลสินค้าเดิม",
  });

  return recalculateProductSummary(productId);
}

export async function recalculateProductSummary(productId) {
  const product = await Product.findById(productId);
  if (!product) throw Object.assign(new Error("Product not found"), { status: 404 });

  const lots = await ProductLot.find({ productId });
  const quantity = lots.reduce((sum, lot) => sum + lot.remainingQuantity, 0);
  const totalCost = lots.reduce((sum, lot) => sum + lot.remainingQuantity * lot.costPerUnit, 0);
  const averageCost = quantity > 0 ? roundMoney(totalCost / quantity) : roundMoney(product.cost);

  product.quantity = quantity;
  product.cost = averageCost;
  product.profit = roundMoney(product.price - averageCost);
  product.status = quantity === 0 ? "out_of_stock" : (product.status === "out_of_stock" ? "active" : product.status);
  await product.save({ validateBeforeSave: false });
  return product;
}

export async function listProductLots(productId) {
  await ensureInitialLot(productId);
  return ProductLot.find({ productId }).sort({ receivedDate: 1, createdAt: 1 });
}

export async function createProductLot(productId, payload) {
  const product = await Product.findById(productId);
  if (!product) throw Object.assign(new Error("Product not found"), { status: 404 });
  await ensureInitialLot(product);

  const quantity = Number(payload.initialQuantity ?? payload.quantity);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw Object.assign(new Error("initialQuantity must be greater than 0"), { status: 400 });
  }
  const costPerUnit = Number(payload.costPerUnit);
  if (!Number.isFinite(costPerUnit) || costPerUnit < 0) {
    throw Object.assign(new Error("costPerUnit is required"), { status: 400 });
  }

  const lot = await ProductLot.create({
    productId: product._id.toString(),
    lotNumber: payload.lotNumber?.trim() || makeLotNumber(),
    receivedDate: payload.receivedDate || new Date().toISOString().split("T")[0],
    initialQuantity: quantity,
    remainingQuantity: Number(payload.remainingQuantity ?? quantity),
    costPerUnit,
    salePrice: Number(payload.salePrice ?? product.price),
    note: payload.note || "",
  });

  await recalculateProductSummary(productId);
  return lot;
}

export async function updateProductLot(productId, lotId, payload) {
  const lot = await ProductLot.findOne({ _id: lotId, productId });
  if (!lot) throw Object.assign(new Error("Product lot not found"), { status: 404 });

  const nextInitialQuantity = payload.initialQuantity === undefined ? lot.initialQuantity : Number(payload.initialQuantity);
  const nextRemainingQuantity = payload.remainingQuantity === undefined ? lot.remainingQuantity : Number(payload.remainingQuantity);
  if (nextRemainingQuantity > nextInitialQuantity) {
    throw Object.assign(new Error("remainingQuantity cannot be greater than initialQuantity"), { status: 400 });
  }

  Object.assign(lot, {
    lotNumber: payload.lotNumber?.trim() || lot.lotNumber,
    receivedDate: payload.receivedDate ?? lot.receivedDate,
    initialQuantity: nextInitialQuantity,
    remainingQuantity: nextRemainingQuantity,
    costPerUnit: payload.costPerUnit === undefined ? lot.costPerUnit : Number(payload.costPerUnit),
    salePrice: payload.salePrice === undefined ? lot.salePrice : Number(payload.salePrice),
    note: payload.note ?? lot.note,
  });

  await lot.save();
  await recalculateProductSummary(productId);
  return lot;
}

export async function deleteProductLot(productId, lotId) {
  const lot = await ProductLot.findOne({ _id: lotId, productId });
  if (!lot) throw Object.assign(new Error("Product lot not found"), { status: 404 });
  if (lot.remainingQuantity !== lot.initialQuantity) {
    throw Object.assign(new Error("Cannot delete a lot that has already been sold"), { status: 400 });
  }

  await lot.deleteOne();
  await recalculateProductSummary(productId);
  return true;
}

export async function deductProductLotsFIFO(productId, quantity, salePrice) {
  await ensureInitialLot(productId);

  const lots = await ProductLot.find({ productId, remainingQuantity: { $gt: 0 } }).sort({ receivedDate: 1, createdAt: 1 });
  const available = lots.reduce((sum, lot) => sum + lot.remainingQuantity, 0);
  if (available < quantity) {
    throw Object.assign(new Error(`Insufficient stock. Have ${available}, need ${quantity}`), { status: 400 });
  }

  let remainingToDeduct = quantity;
  const allocations = [];

  for (const lot of lots) {
    if (remainingToDeduct <= 0) break;

    const deducted = Math.min(lot.remainingQuantity, remainingToDeduct);
    lot.remainingQuantity -= deducted;
    remainingToDeduct -= deducted;
    await lot.save();

    const profitPerUnit = roundMoney(salePrice - lot.costPerUnit);
    allocations.push({
      lotId: lot._id.toString(),
      lotNumber: lot.lotNumber,
      quantity: deducted,
      costPerUnit: lot.costPerUnit,
      profitPerUnit,
      totalProfit: roundMoney(profitPerUnit * deducted),
    });
  }

  await recalculateProductSummary(productId);
  return allocations;
}

export async function syncLotsAfterProductEdit(product, previousProduct) {
  const productId = product._id.toString();
  const lots = await ProductLot.find({ productId }).sort({ receivedDate: 1, createdAt: 1 });

  if (lots.length === 0) {
    if (product.quantity > 0) {
      await ProductLot.create({
        productId,
        lotNumber: "LOT-INITIAL",
        receivedDate: defaultReceivedDate(product),
        initialQuantity: product.quantity,
        remainingQuantity: product.quantity,
        costPerUnit: product.cost,
        salePrice: product.price,
        note: "ล็อตตั้งต้นจากข้อมูลสินค้า",
      });
    }
    return recalculateProductSummary(productId);
  }

  const lotQuantity = lots.reduce((sum, lot) => sum + lot.remainingQuantity, 0);
  const quantityDiff = product.quantity - lotQuantity;

  if (
    lots.length === 1 &&
    lots[0].initialQuantity === lots[0].remainingQuantity &&
    previousProduct?.cost !== product.cost
  ) {
    lots[0].costPerUnit = product.cost;
    await lots[0].save();
  }

  if (quantityDiff > 0) {
    await ProductLot.create({
      productId,
      lotNumber: makeLotNumber("ADJ"),
      receivedDate: new Date().toISOString().split("T")[0],
      initialQuantity: quantityDiff,
      remainingQuantity: quantityDiff,
      costPerUnit: product.cost,
      salePrice: product.price,
      note: "เพิ่มสต็อกจากหน้าแก้ไขสินค้า",
    });
  }

  if (quantityDiff < 0) {
    await deductProductLotsFIFO(productId, Math.abs(quantityDiff), product.price);
  }

  if (previousProduct?.price !== product.price) {
    await ProductLot.updateMany({ productId }, { $set: { salePrice: product.price } });
  }

  return recalculateProductSummary(productId);
}
