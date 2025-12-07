const express = require("express");
const router = express.Router();
const { createOrder, cancelOrder, getOrdersByUserId } = require("../controllers/orderController");

router.post("/", createOrder);
router.get("/user/:userId", getOrdersByUserId);
router.put("/cancel/:id", cancelOrder);

module.exports = router;