const db = require('../config/db');

const Product = {
  getAll: (callback) => {
    const sql = 'SELECT product_id, category_id, name, description, old_price, price, is_active, image_url, is_new FROM products';
    db.query(sql, callback);
  },

  getByCategoryId: (categoryId, callback) => {
    const sql = 'SELECT product_id, category_id, name, description, old_price, price, is_active, image_url, is_new FROM products WHERE category_id = ?';
    db.query(sql, [categoryId], callback);
  },
};

module.exports = Product;