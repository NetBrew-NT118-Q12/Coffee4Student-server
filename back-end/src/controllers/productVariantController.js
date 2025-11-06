const { getAllProductVariants } = require("../models/productVariantModel");

exports.fetchAllProductVariants = (req, res) => {
  getAllProductVariants((err, variants) => {
    if (err) {
      console.error("Error fetching product variants:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.status(200).json(variants);
  });
};