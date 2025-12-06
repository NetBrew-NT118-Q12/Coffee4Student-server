const db = require("../config/db");

const Order = {
  create: (data, callback) => {
    const { user_id, store_id, total_price, status, delivery_type } = data;

    const sql = `
      INSERT INTO orders (user_id, store_id, total_price, status, delivery_type, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;

    db.query(
      sql,
      [user_id, store_id, total_price, status, delivery_type],
      (err, results) => {
        if (err) {
          console.error("Error creating order:", err);
          return callback(err, null);
        }

        callback(null, results.insertId);
      }
    );
  },

  // ✅ HÀM HỦY ĐƠN HÀNG (ĐÃ CÓ NHƯNG CHECK LẠI)
  cancel: (orderId, callback) => {
    const sql = `
      UPDATE orders
      SET status = 'cancelled', updated_at = NOW()
      WHERE order_id = ?
    `;

    db.query(sql, [orderId], (err, result) => {
      if (err) {
        console.error("Error canceling order:", err);
        return callback(err, null);
      }
      callback(null, result);
    });
  },
  getById: (orderId, callback) => {
    const sql = `SELECT * FROM orders WHERE order_id = ?`;
    db.query(sql, [orderId], callback);
  },
};

module.exports = Order;
