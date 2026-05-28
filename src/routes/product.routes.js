import { Router } from "express";
import multer from "multer";
import { ProductController } from "../controllers/product.controller.js";

const upload = multer({ dest: "tmp/" });
const router = Router();

router.get("/", ProductController.list);
router.get("/low-stock", ProductController.getLowProduct);
router.get("/expired", ProductController.getExpiredProducts);
router.get("/:id/lots", ProductController.listLots);
router.get("/:id", ProductController.get);
router.post("/", ProductController.create);
router.post("/:id/lots", ProductController.createLot);
router.put("/:id", ProductController.update);
router.put("/:id/lots/:lotId", ProductController.updateLot);
router.delete("/:id", ProductController.remove);
router.delete("/:id/lots/:lotId", ProductController.deleteLot);

router.post("/:id/stock", ProductController.stockAdjust);
router.post("/:id/recalculate", ProductController.recalculate);
router.post("/upload", upload.single("image"), ProductController.uploadImage);

export default router;
