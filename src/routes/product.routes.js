import { Router } from "express";
import multer from "multer";
import { ProductController } from "../controllers/product.controller.js";

const upload = multer({ dest: "tmp/" });
const router = Router();

router.get("/", ProductController.list);
router.get("/low-stock", ProductController.getLowProduct);
router.get("/expired", ProductController.getExpiredProducts);
router.get("/:id", ProductController.get);
router.post("/", ProductController.create);
router.put("/:id", ProductController.update);
router.delete("/:id", ProductController.remove);

router.post("/:id/stock", ProductController.stockAdjust);
router.post("/upload", upload.single("image"), ProductController.uploadImage);

export default router;
