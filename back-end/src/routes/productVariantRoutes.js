const express = require("express");
const { fetchAllProductVariants, getProductVariantsByProductId } = require("../controllers/productVariantController");

const router = express.Router();

router.get("/", fetchAllProductVariants);
router.get("/:productId", getProductVariantsByProductId);

module.exports = router;