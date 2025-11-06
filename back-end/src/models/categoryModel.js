const db = require('../config/db'); // nếu bạn đang dùng MySQL connection pool

const Category = {
  getAll: (callback) => {
    const sql = 'SELECT category_id, name, image_url FROM categories';
    db.query(sql, callback);
  },
};

module.exports = Category;