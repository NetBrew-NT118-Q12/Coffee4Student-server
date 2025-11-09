require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");

// ========== KHỞI TẠO FIREBASE ADMIN ==========
// Đảm bảo bạn đã có file "serviceAccountKey.json" trong thư mục (ví dụ: src/config)
const admin = require("firebase-admin");
const serviceAccount = require("./src/config/serviceAccountKey.json"); // 👈 Cập nhật đường dẫn này

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
// ============================================

// Routes
const authRoutes = require("./src/routes/authRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const categoryRoutes = require('./src/routes/categoryRoutes');
const productRoutes = require('./src/routes/productRoutes');
const productVariantRoutes = require('./src/routes/productVariantRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const paymentMethodRoutes = require("./src/routes/paymentMethodRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/auth/", authRoutes);
app.use("/profile", profileRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/product-variants', productVariantRoutes);
app.use("/api/orders", orderRoutes);
app.use("/payment-methods", paymentMethodRoutes);
app.use("/payments", paymentRoutes);

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
