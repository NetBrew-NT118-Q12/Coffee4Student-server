// models/feedbackModel.js - ENHANCED VERSION
const db = require("../config/db");

const Feedback = {
  create: (data, callback) => {
    const { order_id, user_id, product_id, star, content } = data;
    const sql = `
      INSERT INTO feedbacks (order_id, user_id, product_id, star, content, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
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
      if (err) return callback(err, false);
      if (results.length === 0) return callback(null, false);
      callback(null, results[0].reviewed === 1);
    });
  },

  markOrderAsReviewed: (order_id, callback) => {
    const sql = "UPDATE orders SET reviewed = 1 WHERE order_id = ?";
    db.query(sql, [order_id], callback);
  },

  // ✅ ENHANCED: Lấy lịch sử review với thông tin sản phẩm
  getByUserId: (user_id, callback) => {
    const sql = `
      SELECT 
        f.feedback_id,
        f.order_id,
        f.star,
        f.content,
        f.created_at,
        s.store_name,
        o.total_price,
        o.created_at as order_date,
        -- Thêm thông tin các sản phẩm trong đơn
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'product_id', oi.product_id,
              'product_name', p.name,
              'quantity', oi.quantity,
              'unit_price', oi.unit_price,
              'image_url', p.image_url
            )
          )
          FROM orderitems oi
          JOIN products p ON oi.product_id = p.product_id
          WHERE oi.order_id = f.order_id
        ) as products
      FROM feedbacks f
      INNER JOIN orders o ON f.order_id = o.order_id
      INNER JOIN stores s ON o.store_id = s.store_id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `;
    db.query(sql, [user_id], callback);
  },

  // ✅ ENHANCED: Lấy đơn hàng chưa review với thông tin sản phẩm
  getUnreviewedOrders: (user_id, callback) => {
    const sql = `
      SELECT 
        o.order_id,
        o.user_id,
        o.store_id,
        s.store_name,
        o.total_price,
        o.created_at,
        o.status,
        o.delivery_type,
        -- Thêm danh sách sản phẩm
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'product_id', oi.product_id,
              'product_name', p.name,
              'quantity', oi.quantity,
              'unit_price', oi.unit_price,
              'subtotal', oi.subtotal,
              'image_url', p.image_url,
              'variant_selection', oi.variant_selection,
              'note', oi.note
            )
          )
          FROM orderitems oi
          JOIN products p ON oi.product_id = p.product_id
          WHERE oi.order_id = o.order_id
        ) as products
      FROM orders o
      INNER JOIN stores s ON o.store_id = s.store_id
      WHERE o.user_id = ? 
        AND o.status = 'completed' 
        AND (o.reviewed = 0 OR o.reviewed IS NULL)
      ORDER BY o.created_at DESC
    `;
    db.query(sql, [user_id], callback);
  },
};

module.exports = Feedback;
