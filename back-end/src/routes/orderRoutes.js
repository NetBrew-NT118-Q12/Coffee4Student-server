const express = require("express");
const router = express.Router();
const { createOrder, cancelOrder, getOrdersByUserId, getOrderDetails, getAllOrders } = require("../controllers/orderController");

router.post("/", createOrder);
router.get("/user/:userId", getOrdersByUserId);
router.put("/cancel/:id", cancelOrder);
router.get("/:id", getOrderDetails);
router.get("/all", getAllOrders);

module.exports = router;
