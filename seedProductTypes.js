// สคริปต์สำหรับเพิ่มข้อมูลตัวอย่าง ProductType
import "dotenv/config";
import mongoose from "mongoose";
import ProductType from "./src/models/ProductType.js";

const sampleProductTypes = [
  {
    name: "เสื้อยืดผ้าฝ้าย",
    description: "เสื้อยืดผ้าฝ้าย 100% คุณภาพดี นุ่มใส่สบาย",
    price: 299,
    category: "เสื้อผ้า",
    imageUrl: "https://example.com/tshirt.jpg"
  },
  {
    name: "กางเกงยีนส์",
    description: "กางเกงยีนส์สไตล์สบายๆ ทนทาน",
    price: 899,
    category: "เสื้อผ้า",
    imageUrl: "https://example.com/jeans.jpg"
  },
  {
    name: "รองเท้าผ้าใบ",
    description: "รองเท้าผ้าใบสไตล์สปอร์ต ใส่สบาย",
    price: 1299,
    category: "รองเท้า",
    imageUrl: "https://example.com/sneaker.jpg"
  },
  {
    name: "กระเป๋าสะพาย",
    description: "กระเป๋าสะพายไหล่ขนาดกะทัดรัด",
    price: 599,
    category: "เครื่องประดับ",
    imageUrl: "https://example.com/bag.jpg"
  }
];

async function seedProductTypes() {
  try {
    // เชื่อมต่อ database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // ลบข้อมูลเก่า (ถ้ามี)
    await ProductType.deleteMany({});
    console.log("🗑️ Cleared existing product types");

    // เพิ่มข้อมูลใหม่
    const result = await ProductType.insertMany(sampleProductTypes);
    console.log(`✅ Inserted ${result.length} product types:`);
    
    result.forEach(item => {
      console.log(`- ${item.name} (${item.category}) - ฿${item.price}`);
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