import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    appId: { type: String },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["admin", "staff"], default: "staff" }
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);