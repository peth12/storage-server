import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    appId: { type: String },
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    type: { type: String, enum: ["in", "out", "adjust"], required: true },
    quantity: { type: Number, required: true, min: 1 },
    reason: { type: String, default: "" },
    billId: { type: String, default: "" },
    createdBy: { type: String, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model("Transaction", TransactionSchema);