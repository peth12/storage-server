import "dotenv/config";
import mongoose from "mongoose";
import Product from "../src/models/Product.js";
import ProductLot from "../src/models/ProductLot.js";
import { ensureInitialLot, recalculateProductSummary } from "../src/services/productLot.service.js";

async function migrateProductLots() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const products = await Product.find().sort({ createdAt: 1 });
  const summary = {
    totalProducts: products.length,
    createdLots: 0,
    skippedExistingLots: 0,
    skippedEmptyProducts: 0,
    recalculated: 0,
  };

  for (const product of products) {
    const productId = product._id.toString();
    const existingLot = await ProductLot.findOne({ productId });

    if (existingLot) {
      summary.skippedExistingLots += 1;
      await recalculateProductSummary(productId);
      summary.recalculated += 1;
      console.log(`↷ ${product.name}: มีล็อตอยู่แล้ว, recalculated`);
      continue;
    }

    if (product.quantity <= 0) {
      summary.skippedEmptyProducts += 1;
      await recalculateProductSummary(productId);
      summary.recalculated += 1;
      console.log(`- ${product.name}: ข้ามเพราะจำนวนคงเหลือ 0`);
      continue;
    }

    await ensureInitialLot(product);
    summary.createdLots += 1;
    summary.recalculated += 1;
    console.log(`+ ${product.name}: created LOT-INITIAL (${product.quantity} units, cost ${product.cost})`);
  }

  console.log("✅ Product lot migration complete");
  console.table(summary);
  await mongoose.connection.close();
  console.log("✅ Database connection closed");
}

migrateProductLots().catch(async (error) => {
  console.error("❌ Product lot migration failed:", error);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
