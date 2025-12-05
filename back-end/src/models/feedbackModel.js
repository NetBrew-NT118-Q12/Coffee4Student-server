// models/feedbackModel.js
const db = require("../config/db");

const Feedback = {
  create: (data, callback) => {
    const { order_id, user_id, product_id, star, content } = data;
    const sql = `
      INSERT INTO feedbacks (order_id, user_id, product_id, star, content)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(
      sql,
      [order_id, user_id, product_id || null, star, content || ""],
      callback
    );
  },

  checkIfReviewed: (order_id, callback) => {
    const sql = "SELECT reviewed FROM orders WHERE order_id = ?";
    db.query(sql, [order_id], (err, results) => {
      if (err || results.length === 0) return callback(err, false);
      callback(null, results[0].reviewed === 1);
    });
  },

  markOrderAsReviewed: (order_id, callback) => {
    const sql = "UPDATE orders SET reviewed = 1 WHERE order_id = ?";
    db.query(sql, [order_id], callback);
  },

  getByUserId: (user_id, callback) => {
    const sql = `
      SELECT 
        f.feedback_id,
        f.order_id,
        f.star,
        f.content,
        f.created_at,
        o.store_name,
        o.total_price
      FROM feedbacks f
      JOIN orders o ON f.order_id = o.order_id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `;
    db.query(sql, [user_id], callback);
  },

  getUnreviewedOrders: (user_id, callback) => {
    const sql = `
    SELECT 
      o.order_id,
      o.user_id,
      o.store_id,
      s.store_name,          -- ✅ Lấy từ bảng stores
      o.total_price,
      o.created_at,
      o.status,
      o.delivery_type
    FROM orders o
    INNER JOIN stores s ON o.store_id = s.store_id  -- ✅ JOIN với stores
    WHERE o.user_id = ? 
      AND o.status = 'completed' 
      AND o.reviewed = 0
    ORDER BY o.created_at DESC
  `;
    db.query(sql, [user_id], callback);
  },
};

module.exports = Feedback;
