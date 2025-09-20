import Transaction from "../models/Transaction.js";

export async function listTransactions({ page = 1, limit = 20, type, productId }) {
  const filter = {};
  if (type) filter.type = type;
  if (productId) filter.productId = productId;

  const [items, total] = await Promise.all([
    Transaction.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
    Transaction.countDocuments(filter)
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
}
