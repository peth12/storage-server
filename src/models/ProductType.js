import mongoose from "mongoose";

const productTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product type name is required"],
      unique: true,
      trim: true
    },
    sortOrder: {
      type: Number,
      required: true,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: "producttypes"
  }
);

export default mongoose.model("ProductType", productTypeSchema);
