const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const authRoutes = require("./src/routes/authRoutes");
const profileRoutes = require("./src/routes/profileRoutes");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/auth/", authRoutes);
app.use("/profile", profileRoutes);
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/upload/users", express.static(path.join(__dirname, "upload/users")));

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));