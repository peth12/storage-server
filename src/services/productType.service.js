import ProductType from "../models/ProductType.js";

export const ProductTypeService = {
  // ดึงรายการ product types ทั้งหมด
  async getAll() {
    return await ProductType.find().sort({ createdAt: -1 });
  },

  // ดึง product type ตาม id
  async getById(id) {
    return await ProductType.findById(id);
  },

  // สร้าง product type ใหม่
  async create(data) {
    const productType = new ProductType(data);
    return await productType.save();
  },

  // อัพเดท product type
  async update(id, data) {
    return await ProductType.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );
  },

  // ลบ product type
  async delete(id) {
    return await ProductType.findByIdAndDelete(id);
  },

  // ค้นหา product type ตามชื่อ
  async findByName(name) {
    return await ProductType.findOne({ name: { $regex: name, $options: 'i' } });
  },

  // ค้นหา product type ตาม category
  async findByCategory(category) {
    return await ProductType.find({ category: { $regex: category, $options: 'i' } });
  }
};