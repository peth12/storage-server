import Product from "../models/Product.js";

function normalizeProductCode(appId) {
  return typeof appId === "string" ? appId.trim() : appId;
}

function normalizeStockStatus(payload) {
  const nextPayload = { ...payload };
  const quantity = Number(nextPayload.quantity);

  if (!Number.isFinite(quantity)) return nextPayload;

  if (quantity <= 0) {
    nextPayload.status = "out_of_stock";
  } else if (nextPayload.status === "out_of_stock") {
    nextPayload.status = "active";
  }

  return nextPayload;
}

async function assertUniqueProductCode(appId, currentProductId) {
  const code = normalizeProductCode(appId);
  if (!code) return;

  const filter = { appId: code };
  if (currentProductId) filter._id = { $ne: currentProductId };

  const conflictProduct = await Product.findOne(filter).select("_id appId name type price quantity status");
  if (!conflictProduct) return;

  throw Object.assign(new Error("รหัสสินค้านี้มีอยู่แล้ว"), {
    status: 409,
    details: {
      code: "DUPLICATE_PRODUCT_CODE",
      conflictProduct,
    },
  });
}

export async function listProducts({ page = 1, limit = 20, q }) {
  const filter = {};
  if (q) filter.name = { $regex: q, $options: "i" };

  const [items, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
    Product.countDocuments(filter)
  ]);
  return { items, total, page: Number(page), limit: Number(limit) };
}

export async function getProduct(id) {
  return Product.findById(id);
}

export async function createProduct(payload) {
  const nextPayload = normalizeStockStatus({ ...payload, appId: normalizeProductCode(payload.appId) });
  const prod = new Product(nextPayload);
  if (!nextPayload.appId) {
    prod.appId = prod._id.toString();
  } else {
    await assertUniqueProductCode(nextPayload.appId);
  }
  await prod.save();
  return prod;
}

export async function updateProduct(id, payload) {
  const nextPayload = normalizeStockStatus({ ...payload, appId: normalizeProductCode(payload.appId) });
  if (!nextPayload.appId) {
    nextPayload.appId = id;
  }
  await assertUniqueProductCode(nextPayload.appId, id);
  const prod = await Product.findByIdAndUpdate(id, nextPayload, { new: true, runValidators: true });
  return prod;
}

export async function deleteProduct(id) {
  await Product.findByIdAndDelete(id);
  return true;
}

export async function adjustStock({ productId, delta }) {
  const prod = await Product.findById(productId);
  if (!prod) throw Object.assign(new Error("Product not found"), { status: 404 });
  const nextQty = prod.quantity + delta;
  if (nextQty < 0) throw Object.assign(new Error("Insufficient stock"), { status: 400 });
  prod.quantity = nextQty;
  prod.status = prod.quantity === 0 ? "out_of_stock" : (prod.status === "out_of_stock" ? "active" : prod.status);
  await prod.save();
  return prod;
}

export async function getLowProduct() {
  const lowStockThreshold = 10;
  const products = await Product.find({ quantity: { $gt: 0, $lte: lowStockThreshold } });
  return products;
}

export async function getExpiredProducts() {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0]; 

  const products = await Product.find({
    expirationDate: { $lte: todayString }
  });

  return products;
}
