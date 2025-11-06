const express = require("express");
const { fetchAllProductVariants } = require("../controllers/productVariantController");

const router = express.Router();

router.get("/", fetchAllProductVariants);

module.exports = router;