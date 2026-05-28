# Backend Bug & Feature Development Guide

เอกสารนี้ใช้เป็นคู่มือสำหรับหา bug และพัฒนา feature ใหม่ของ `storage-server` ซึ่งเป็น backend ของระบบจัดการสต็อกสินค้า สร้างด้วย Node.js, Express, Mongoose, Joi, Multer และ Cloudinary

## ภาพรวมโปรเจกต์

- Entry point: `src/server.js`
- Express app: `src/app.js`
- Database config: `src/config/db.js`
- Cloudinary config: `src/config/cloudinary.js`
- Routes: `src/routes`
- Controllers และ validation: `src/controllers`
- Business logic: `src/services`
- Mongoose models: `src/models`
- Error middleware: `src/middlewares/errorHandler.js`
- Utility: `src/utils`

Flow หลักของ request คือ

```text
client -> route -> controller/Joi validation -> service -> model/database -> response
```

## คำสั่งที่ใช้บ่อย

```sh
npm install
npm run dev
npm start
```

ตอนนี้ backend ยังไม่มี test script และ lint script ใน `package.json` ถ้าจะเพิ่มความมั่นใจระยะยาว แนะนำเพิ่ม test runner เช่น Vitest/Jest + Supertest สำหรับ API tests

## Environment ที่ต้องมี

สร้างไฟล์ `.env` ใน `storage-server`

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/storage
TAX_RATE=0.07
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

ถ้า API start ไม่ขึ้น ให้เช็ก `MONGO_URI` ก่อน เพราะ `src/server.js` connect database ก่อนเปิด port

## API Surface ปัจจุบัน

- `GET /` health check
- `/api/products` จัดการสินค้า
- `/api/product-types` จัดการประเภทสินค้า
- `/api/bills` จัดการบิล
- `/api/transactions` ดูรายการ transaction
- `/api/users` จัดการ user แบบพื้นฐาน
- `/api/dashboard` summary/dashboard

## Flow การหา Bug

1. ระบุ endpoint, method, request body, query string และ response ที่ผิด
2. ดู route ใน `src/routes` ว่า request เข้า controller ไหน
3. ตรวจ Joi schema ใน controller ว่ารับ payload ตรงกับ frontend หรือไม่
4. ไล่ business logic ใน service โดยเฉพาะ stock, bill total, transaction และ pagination
5. ตรวจ model ว่า enum, required field และ default ตรงกับ controller หรือไม่
6. ดู error response จาก `errorHandler` ว่าส่ง status/message ถูกต้อง
7. ทดสอบซ้ำด้วย curl/Postman/Thunder Client โดยไม่ผ่าน frontend
8. ถ้าเกี่ยวกับ stock หรือ bill ให้ตรวจ database ก่อนและหลัง request

## Checklist สำหรับ Bug Report

- [ ] Endpoint:
- [ ] Method:
- [ ] Request body/query:
- [ ] Response status/body:
- [ ] ผลลัพธ์ที่คาดหวัง:
- [ ] ผลลัพธ์จริง:
- [ ] Log จาก server:
- [ ] ข้อมูลตัวอย่างใน MongoDB:
- [ ] กระทบ stock, bill หรือ transaction หรือไม่:
- [ ] Reproduce ได้กี่ครั้ง:

## จุดเสี่ยงที่ควรตรวจบ่อย

- `ProductController.update` ใช้ schema เดียวกับ create ถึงแม้จะใส่ `allowUnknown` แต่ field required ยังอาจทำให้ partial update ยาก
- `Bill.status` ใน backend model มี `draft`, `completed`, `void` แต่บาง frontend type ยังใช้ `cancelled`
- `billCreateSchema` รับเฉพาะ `draft` และ `completed` แต่ model มี `void`
- `createBill` และ `applyBillStockEffects` ยังไม่ได้ใช้ MongoDB transaction ถ้า save stock สำเร็จบางรายการแล้ว transaction record fail อาจเกิดข้อมูลไม่ครบ
- `computeTotals` ใช้ unary plus แต่ยังไม่ได้ round ทศนิยมชัดเจน อาจเกิดค่าทศนิยมยาวจาก floating point
- `generateBillNumber()` ต้องมั่นใจว่าไม่ชนกัน เพราะ `billNumber` unique
- `Product.findByIdAndUpdate` ไม่ได้ใส่ `runValidators: true` ทำให้ update อาจข้าม validation ของ Mongoose
- Product image upload ใช้ Multer temp path แต่ยังไม่มี cleanup ไฟล์ temp หลัง upload
- CORS เปิดกว้างด้วย `cors()` ควรจำกัด origin เมื่อ deploy production
- ไม่มี authentication/authorization จริงใน API ถึงแม้ frontend มี mock auth

## Flow พัฒนา Feature ใหม่

1. นิยาม contract ของ API ก่อน: endpoint, method, request, response, status code
2. เพิ่มหรือแก้ model ใน `src/models` ถ้าต้องเก็บข้อมูลใหม่
3. เพิ่ม service function ใน `src/services` สำหรับ business logic
4. เพิ่ม Joi validation และ controller method ใน `src/controllers`
5. เพิ่ม route ใน `src/routes`
6. ผูก route ใน `src/app.js` ถ้าเป็น domain ใหม่
7. ทดสอบ manual ด้วย API client
8. ตรวจผลกระทบกับ frontend type และ API call
9. เพิ่ม test ถ้า feature แตะ stock, bill, payment, report หรือข้อมูลที่แก้กลับยาก

## Pattern การเพิ่ม Resource ใหม่

ตัวอย่างถ้าจะเพิ่ม `suppliers`

```text
src/models/Supplier.js
src/services/supplier.service.js
src/controllers/supplier.controller.js
src/routes/supplier.routes.js
```

จากนั้นเพิ่มใน `src/app.js`

```js
import supplierRoutes from "./routes/supplier.routes.js";
app.use("/api/suppliers", supplierRoutes);
```

ควรรักษา pattern เดิมของโปรเจกต์ คือ controller รับผิดชอบ validation/response ส่วน service รับผิดชอบ business logic และ database operation

## Manual Test Cases สำคัญ

- Product: list, search, get by id, create, update, delete
- Product stock: เพิ่ม/ลด stock แล้วห้ามติดลบ
- Low stock: `GET /api/products/low-stock` คืนสินค้าที่ quantity ต่ำกว่า threshold
- Expired products: `GET /api/products/expired` คืนสินค้าที่หมดอายุแล้ว
- Bill draft: สร้างบิล draft แล้ว stock ยังไม่ลด
- Bill completed: สร้างหรือเปลี่ยนเป็น completed แล้ว stock ลดและสร้าง transaction
- Bill insufficient stock: ต้องได้ 400 และ stock ต้องไม่ถูกลด
- Dashboard: summary ตรงกับข้อมูลจริงใน database
- Error: ส่ง id ผิดหรือ payload ผิดแล้วได้ status/message ที่อ่านรู้เรื่อง

## ตัวอย่าง curl สำหรับ Debug เร็ว

```sh
curl http://localhost:4000/
curl http://localhost:4000/api/products
curl "http://localhost:4000/api/products?q=milk"
curl http://localhost:4000/api/products/low-stock
curl http://localhost:4000/api/products/expired
```

สร้างสินค้า

```sh
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","type":"general","quantity":10,"price":100,"cost":60,"profit":40,"status":"active"}'
```

สร้างบิล completed

```sh
curl -X POST http://localhost:4000/api/bills \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":"PRODUCT_ID","quantity":1}],"status":"completed","createdBy":"admin"}'
```

## Definition of Done

- [ ] API contract ชัดเจนและ frontend ใช้ได้
- [ ] Validation ครอบคลุม payload สำคัญ
- [ ] Error status/message ถูกต้อง
- [ ] ไม่มี data corruption ใน stock, bill, transaction
- [ ] Manual test ผ่านทั้ง success และ failure case
- [ ] ถ้าแก้ logic สำคัญ มี test หรืออย่างน้อยมี curl/manual evidence
- [ ] Environment ใหม่ถูกบันทึกในเอกสาร
- [ ] ไม่มี secret ถูก commit

