// สคริปต์สำหรับเพิ่มข้อมูลตัวอย่าง ProductType
import "dotenv/config";
import mongoose from "mongoose";
import { ProductTypeService } from "./src/services/productType.service.js";

async function seedProductTypes() {
  try {
    // เชื่อมต่อ database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const result = await ProductTypeService.ensureDefaults();
    console.log(`✅ Synced ${result.length} product types:`);
    
    result.forEach(item => {
      console.log(`- ${item.name}`);
    });

    // ปิดการเชื่อมต่อ
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
    
  } catch (error) {
    console.error("❌ Error seeding product types:", error);
    process.exit(1);
  }
}

seedProductTypes();
