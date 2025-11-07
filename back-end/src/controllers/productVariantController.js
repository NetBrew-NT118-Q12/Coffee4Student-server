const { getAllProductVariants, getByProductId } = require("../models/productVariantModel");

exports.fetchAllProductVariants = (req, res) => {
  getAllProductVariants((err, variants) => {
    if (err) {
      console.error("Error fetching product variants:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.status(200).json(variants);
  });
};

// Lấy biến thể theo product_id
exports.getProductVariantsByProductId = (req, res) => {
  const { productId } = req.params;

  getByProductId(productId, (err, results) => {
    if (err) {
      console.error("Error fetching product variants by productId:", err);
      return res.status(500).json({ message: "Server error fetching product variants" });
    }
    res.status(200).json(results);
  });
};