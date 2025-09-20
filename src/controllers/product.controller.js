import Joi from "joi";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getLowProduct,
  getExpiredProducts
} from "../services/product.service.js";
import { v2 as cloudinary } from "cloudinary";

const productSchema = Joi.object({
  appId: Joi.string().optional(),
  name: Joi.string().required(),
  type: Joi.string().required(),
  quantity: Joi.number().min(0).default(0),
  price: Joi.number().min(0).required(),
  cost: Joi.number().min(0).required(),
  profit: Joi.number().min(0).default(0),
  status: Joi.string().valid("active", "inactive", "out_of_stock").default("active"),
  expirationDate: Joi.string().allow(""),
  image: Joi.string().uri().allow("")
});

export const ProductController = {
  list: asyncHandler(async (req, res) => {
    const data = await listProducts(req.query);
    res.json(data);
  }),
  get: asyncHandler(async (req, res) => {
    const prod = await getProduct(req.params.id);
    if (!prod) return res.status(404).json({ message: "Not found" });
    res.json(prod);
  }),
  create: asyncHandler(async (req, res) => {
    const { error, value } = productSchema.validate(req.body);
    if (error) throw Object.assign(new Error(error.message), { status: 400 });
    const prod = await createProduct(value);
    res.status(201).json(prod);
  }),
  update: asyncHandler(async (req, res) => {
    const { error, value } = productSchema.validate(req.body, { allowUnknown: true });
    if (error) throw Object.assign(new Error(error.message), { status: 400 });
    const prod = await updateProduct(req.params.id, value);
    res.json(prod);
  }),
  remove: asyncHandler(async (req, res) => {
    await deleteProduct(req.params.id);
    res.status(204).end();
  }),
  stockAdjust: asyncHandler(async (req, res) => {
    const { delta } = req.body; // e.g., { delta: -3 }
    if (typeof delta !== "number") throw Object.assign(new Error("delta required"), { status: 400 });
    const prod = await adjustStock({ productId: req.params.id, delta });
    res.json(prod);
  }),
  uploadImage: asyncHandler(async (req, res) => {
    if (!req.file) throw Object.assign(new Error("No file"), { status: 400 });
    const upload = await cloudinary.uploader.upload(req.file.path, { folder: "products" });
    res.json({ url: upload.secure_url });
  }),

  getLowProduct: asyncHandler(async (req, res) => {
    const data = await getLowProduct();
    res.json(data);
  }),
  
  getExpiredProducts: asyncHandler(async (req, res) => {
    const data = await getExpiredProducts();
    res.json(data);
  })
  
};
