import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import productRoutes from "./routes/product.routes.js";
import productTypeRoutes from "./routes/productType.routes.js";
import billRoutes from "./routes/bill.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import userRoutes from "./routes/user.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import  dashboardRoutes from "./routes/dashboard.routes.js";
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) => res.json({ ok: true, name: "stock-backend" }));

app.use("/api/products", productRoutes);
app.use("/api/product-types", productTypeRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(errorHandler);

export default app;
