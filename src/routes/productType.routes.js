import { Router } from "express";
import { ProductTypeController } from "../controllers/productType.controller.js";

const router = Router();

// GET /api/product-types - ดึงรายการ product types ทั้งหมด
router.get("/", ProductTypeController.list);

// GET /api/product-types/:id - ดึง product type ตาม id
router.get("/:id", ProductTypeController.get);

// POST /api/product-types - สร้าง product type ใหม่
router.post("/", ProductTypeController.create);

// PUT /api/product-types/:id - อัพเดท product type
router.put("/:id", ProductTypeController.update);

// DELETE /api/product-types/:id - ลบ product type
router.delete("/:id", ProductTypeController.remove);

export default router;