import { ProductTypeService } from "../services/productType.service.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

export const ProductTypeController = {
  // ดึงรายการ product types ทั้งหมด
  list: asyncHandler(async (req, res) => {
    const productTypes = await ProductTypeService.getAll();
    res.json(productTypes);
  }),

  // ดึง product type ตาม id
  get: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const productType = await ProductTypeService.getById(id);
    if (!productType) {
      return res.status(404).json({ message: "Product type not found" });
    }
    res.json(productType);
  }),

  // สร้าง product type ใหม่
  create: asyncHandler(async (req, res) => {
    const productType = await ProductTypeService.create(req.body);
    res.status(201).json(productType);
  }),

  // อัพเดท product type
  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const productType = await ProductTypeService.update(id, req.body);
    if (!productType) {
      return res.status(404).json({ message: "Product type not found" });
    }
    res.json(productType);
  }),

  // ลบ product type
  remove: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const productType = await ProductTypeService.delete(id);
    if (!productType) {
      return res.status(404).json({ message: "Product type not found" });
    }
    res.json({ message: "Product type deleted successfully" });
  })
};