import { Router } from "express";
import { BillController } from "../controllers/bill.controller.js";

const router = Router();

router.get("/", BillController.list);
router.get("/:id", BillController.get);
router.post("/", BillController.create);
router.patch("/:id/status", BillController.setStatus);

export default router;
