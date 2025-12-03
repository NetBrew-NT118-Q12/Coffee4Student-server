const express = require("express");
const router = express.Router();
const { createOrder, cancelOrder } = require("../controllers/orderController");

// ✅ Route tạo đơn hàng
router.post("/", createOrder);

// ✅ Route hủy đơn hàng
router.put("/cancel/:id", cancelOrder);

module.exports = router;
