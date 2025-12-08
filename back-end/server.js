require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");

const admin = require("firebase-admin");
const serviceAccount = require("./src/config/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Routes
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const categoryRoutes = require('./src/routes/categoryRoutes');
const productRoutes = require('./src/routes/productRoutes');
const productVariantRoutes = require('./src/routes/productVariantRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const orderItemRoutes = require('./src/routes/orderItemRoutes');
const paymentMethodRoutes = require("./src/routes/paymentMethodRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const storeRoutes = require("./src/routes/storeRoutes");
const popularProductRoutes = require("./src/routes/popularProductRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const voucherRoutes = require('./src/routes/voucherRoutes');
const recommendationRoutes = require("./src/routes/recommendationRoutes"); 
const mlRecommendationRoutes = require("./src/routes/mlRecommendationRoutes"); 
const feedbackRoutes = require("./src/routes/feedbackRoutes");


const app = express();
app.use(cors());
app.use(bodyParser.json());


// Routes
app.use("/auth/", authRoutes);
app.use("/api/users", userRoutes);
app.use("/profile", profileRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/product-variants', productVariantRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/order-items/", orderItemRoutes);
app.use("/payment-methods", paymentMethodRoutes);
app.use("/payments", paymentRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/popular-products", popularProductRoutes);
app.use("/api/notifications", notificationRoutes);
app.use('/api', voucherRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/ml-recommendations", mlRecommendationRoutes); 
app.use("/api/feedbacks", feedbackRoutes); 

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
