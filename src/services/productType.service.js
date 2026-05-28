import ProductType from "../models/ProductType.js";
import { PRODUCT_TYPES } from "../constants/productTypes.js";

function isAllowedProductTypeName(name) {
  return PRODUCT_TYPES.includes(name);
}

export const ProductTypeService = {
  async ensureDefaults() {
    await ProductType.bulkWrite(
      PRODUCT_TYPES.map((name, index) => ({
        updateOne: {
          filter: { name },
          update: { $set: { name, sortOrder: index, isActive: true } },
          upsert: true
        }
      }))
    );

    return this.getAll();
  },

  // ดึงรายการ product types ทั้งหมด
  async getAll() {
    return await ProductType.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
  },

  // ดึง product type ตาม id
  async getById(id) {
    return await ProductType.findById(id);
  },

  // สร้าง product type ใหม่
  async create(data) {
    if (!isAllowedProductTypeName(data.name)) {
      throw Object.assign(new Error("Product type is not allowed"), { status: 400 });
    }

    const productType = new ProductType(data);
    return await productType.save();
  },

  // อัพเดท product type
  async update(id, data) {
    if (data.name && !isAllowedProductTypeName(data.name)) {
      throw Object.assign(new Error("Product type is not allowed"), { status: 400 });
    }

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
    return await ProductType.find({ name: { $regex: category, $options: 'i' } });
  }
};
