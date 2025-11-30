const express = require("express");
const router = express.Router();
const popularProductController = require("../controllers/popularProductController");

// GET /api/popular-products
// Query params: ?days=7&limit=5 (tùy chọn)
router.get("/", popularProductController.getPopularProducts);

module.exports = router;
