import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    appId: { type: String, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true },
    quantity: { type: Number, default: 0, min: 0 },
    price: { type: Number, required: true, min: 0 },
    cost: { type: Number, required: true, min: 0 },
    profit: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["active", "inactive", "out_of_stock"], default: "active" },
    expirationDate: { type: String, default: "" },
    image: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);