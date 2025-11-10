
const db = require('../config/db');

exports.getAllProductVariants = (callback) => {
  const sql = 'SELECT * FROM productvariants';
  db.query(sql, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

  // Lấy biến thể theo sản phẩm (ví dụ khi click vào 1 Product)
exports.getByProductId = (productId, callback) => {
    const sql = `SELECT * FROM productvariants WHERE product_id = ?`;
    db.query(sql, [productId], callback);
};