import mongoose from "mongoose";

const BillItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const BillSchema = new mongoose.Schema(
  {
    billNumber: { type: String, required: true, unique: true },
    items: { type: [BillItemSchema], default: [] },
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["draft", "completed", "void"], default: "draft" },
    createdBy: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Bill", BillSchema);