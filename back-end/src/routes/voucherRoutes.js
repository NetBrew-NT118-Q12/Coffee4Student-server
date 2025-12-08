const express = require('express');
const router = express.Router();
const vouchers = require("../controllers/voucherController");

router.get("/my-vouchers/:userId", vouchers.getUserVouchers);

module.exports = router;