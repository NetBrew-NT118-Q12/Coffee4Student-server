const express = require("express");
const router = express.Router();
const orderItemController = require("../controllers/orderItemController");

router.get("/user/:userId", orderItemController.getItemsByUserId);

module.exports = router;