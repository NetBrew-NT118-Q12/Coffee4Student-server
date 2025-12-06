const express = require("express");
const router = express.Router();
const {
  createOrder,
  cancelOrder,
  getOrderDetails,
} = require("../controllers/orderController");

router.post("/", createOrder);
router.put("/cancel/:id", cancelOrder);
router.get("/:id", getOrderDetails);

module.exports = router;
