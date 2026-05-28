import mongoose from "mongoose";

const LotAllocationSchema = new mongoose.Schema(
  {
    lotId: { type: String, required: true },
    lotNumber: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    costPerUnit: { type: Number, required: true, min: 0 },
    profitPerUnit: { type: Number, required: true },
    totalProfit: { type: Number, required: true },
  },
  { _id: false }
);

const BillItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    lotAllocations: { type: [LotAllocationSchema], default: [] },
    totalCost: { type: Number, default: 0 },
    totalProfit: { type: Number, default: 0 },
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
