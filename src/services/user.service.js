import User from "../models/User.js";

export async function createUser(payload) {
  return User.create(payload);
}

export async function listUsers({ page = 1, limit = 20, q }) {
  const filter = {};
  if (q) filter.username = { $regex: q, $options: "i" };
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
    User.countDocuments(filter)
  ]);
  return { items, total, page: Number(page), limit: Number(limit) };
}
