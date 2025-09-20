import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { configCloudinary } from "./config/cloudinary.js";

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  await connectDB(process.env.MONGO_URI);
  configCloudinary();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

bootstrap();
