require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const authRoutes = require("./src/routes/authRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const categoryRoutes = require('./src/routes/categoryRoutes');
const productRoutes = require('./src/routes/productRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/auth/", authRoutes);
app.use("/profile", profileRoutes);
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/upload", express.static(path.join(__dirname, "upload")));
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));