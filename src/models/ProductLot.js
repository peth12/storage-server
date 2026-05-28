import mongoose from "mongoose";

const ProductLotSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, index: true },
    lotNumber: { type: String, required: true, trim: true },
    receivedDate: { type: String, default: "" },
    initialQuantity: { type: Number, required: true, min: 0 },
    remainingQuantity: { type: Number, required: true, min: 0 },
    costPerUnit: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, required: true, min: 0 },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

ProductLotSchema.index({ productId: 1, lotNumber: 1 }, { unique: true });

export default mongoose.model("ProductLot", ProductLotSchema);
