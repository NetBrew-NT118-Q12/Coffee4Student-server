const express = require("express");
const router = express.Router();
const { getPaymentMethodByName } = require("../controllers/paymentMethodController");

router.post("/by-name", getPaymentMethodByName);

module.exports = router;