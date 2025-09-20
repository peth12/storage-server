import mongoose from "mongoose";

const ProductType = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        category: { type: String, required: true },
        imageUrl: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.model("ProductType", ProductType);