const Product = require('../models/productModel');

exports.getAllProducts = (req, res) => {
  Product.getAll((err, results) => {
    if (err) return res.status(500).json({ message: 'Lỗi lấy sản phẩm', error: err });
    res.status(200).json(results);
  });
};

exports.getProductsByCategory = (req, res) => {
  const { category_id } = req.params;
  Product.getByCategoryId(category_id, (err, results) => {
    if (err) return res.status(500).json({ message: 'Lỗi lấy sản phẩm theo danh mục', error: err });
    res.status(200).json(results);
  });
};