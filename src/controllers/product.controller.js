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
import {
  createProductLot,
  deleteProductLot,
  listProductLots,
  recalculateProductSummary,
  updateProductLot
} from "../services/productLot.service.js";
import { PRODUCT_TYPES } from "../constants/productTypes.js";
import { v2 as cloudinary } from "cloudinary";

const productSchema = Joi.object({
  appId: Joi.string().allow("").optional(),
  name: Joi.string().required(),
  type: Joi.string().valid(...PRODUCT_TYPES).required(),
  quantity: Joi.number().min(0).default(0),
  price: Joi.number().min(0).required(),
  cost: Joi.number().min(0).required(),
  profit: Joi.number().default(0),
  status: Joi.string().valid("active", "inactive", "out_of_stock").default("active"),
  expirationDate: Joi.string().allow(""),
  image: Joi.string().uri().allow("")
});

const productLotSchema = Joi.object({
  lotNumber: Joi.string().allow("").optional(),
  receivedDate: Joi.string().allow("").optional(),
  initialQuantity: Joi.number().min(0).optional(),
  remainingQuantity: Joi.number().min(0).optional(),
  costPerUnit: Joi.number().min(0).optional(),
  salePrice: Joi.number().min(0).optional(),
  note: Joi.string().allow("").optional()
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
  }),

  listLots: asyncHandler(async (req, res) => {
    const lots = await listProductLots(req.params.id);
    res.json(lots);
  }),

  createLot: asyncHandler(async (req, res) => {
    const { error, value } = productLotSchema.validate(req.body);
    if (error) throw Object.assign(new Error(error.message), { status: 400 });
    const lot = await createProductLot(req.params.id, value);
    res.status(201).json(lot);
  }),

  updateLot: asyncHandler(async (req, res) => {
    const { error, value } = productLotSchema.validate(req.body, { allowUnknown: true });
    if (error) throw Object.assign(new Error(error.message), { status: 400 });
    const lot = await updateProductLot(req.params.id, req.params.lotId, value);
    res.json(lot);
  }),

  deleteLot: asyncHandler(async (req, res) => {
    await deleteProductLot(req.params.id, req.params.lotId);
    res.status(204).end();
  }),

  recalculate: asyncHandler(async (req, res) => {
    const product = await recalculateProductSummary(req.params.id);
    res.json(product);
  })
  
};
