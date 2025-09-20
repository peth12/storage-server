import Joi from "joi";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { createBill, listBills, getBill, updateBillStatus } from "../services/bill.service.js";

const billCreateSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      productName: Joi.string().optional(),
      quantity: Joi.number().min(1).required(),
      price: Joi.number().min(0).optional()
    })
  ).min(1).required(),
  status: Joi.string().valid("draft", "completed").default("draft"),
  createdBy: Joi.string().required()
});

export const BillController = {
  create: asyncHandler(async (req, res) => {
    const { error, value } = billCreateSchema.validate(req.body);
    if (error) throw Object.assign(new Error(error.message), { status: 400 });
    const bill = await createBill(value);
    res.status(201).json(bill);
  }),
  list: asyncHandler(async (req, res) => {
    const data = await listBills(req.query);
    res.json(data);
  }),
  get: asyncHandler(async (req, res) => {
    const bill = await getBill(req.params.id);
    if (!bill) return res.status(404).json({ message: "Not found" });
    res.json(bill);
  }),
  setStatus: asyncHandler(async (req, res) => {
    const { status, actor } = req.body; // actor = user id
    if (!status || !actor) throw Object.assign(new Error("status and actor required"), { status: 400 });
    const bill = await updateBillStatus(req.params.id, status, actor);
    res.json(bill);
  })
};
