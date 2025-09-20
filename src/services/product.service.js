import Product from "../models/Product.js";

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
  const prod = await Product.create(payload);
  return prod;
}

export async function updateProduct(id, payload) {
  const prod = await Product.findByIdAndUpdate(id, payload, { new: true });
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
  prod.status = prod.quantity === 0 ? "out_of_stock" : prod.status;
  await prod.save();
  return prod;
}

export async function getLowProduct() {
  const lowStockThreshold = 5;
  const products = await Product.find({ quantity: { $lt: lowStockThreshold } });
  return products;
}

export async function getExpiredProducts() {
  const today = new Date();
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(today.getDate() + 7);

  const todayStr = today.toISOString().split("T")[0];
  const sevenDaysLaterStr = sevenDaysLater.toISOString().split("T")[0];

  const products = await Product.find({
    expirationDate: { $gte: todayStr, $lte: sevenDaysLaterStr }
  });

  return products;
}

