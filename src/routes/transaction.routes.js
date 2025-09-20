import { Router } from "express";
import { TransactionController } from "../controllers/transaction.controller.js";

const router = Router();

router.get("/", TransactionController.list);

export default router;
