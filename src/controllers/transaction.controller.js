import { asyncHandler } from "../middlewares/asyncHandler.js";
import { listTransactions } from "../services/transaction.service.js";

export const TransactionController = {
  list: asyncHandler(async (req, res) => {
    const data = await listTransactions(req.query);
    res.json(data);
  })
};
