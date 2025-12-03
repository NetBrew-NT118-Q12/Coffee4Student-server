const express = require("express");
const router = express.Router();
const { createOrder, cancelOrder } = require("../controllers/orderController");

router.post("/", createOrder);
router.put("/cancel/:id", cancelOrder);

module.exports = router;