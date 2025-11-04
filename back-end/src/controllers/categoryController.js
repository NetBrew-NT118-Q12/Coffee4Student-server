const Category = require('../models/categoryModel');

exports.getAllCategories = (req, res) => {
  Category.getAll((err, results) => {
    if (err) return res.status(500).json({ message: 'Lỗi lấy danh mục', error: err });
    res.status(200).json(results);
  });
};