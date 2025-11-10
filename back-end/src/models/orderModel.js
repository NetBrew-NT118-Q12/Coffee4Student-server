const db = require("../config/db");

const Order = {
  create: (data, callback) => {
    const { user_id, store_id, total_price, status } = data;

    const sql = `
      INSERT INTO orders (user_id, store_id, total_price, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, now(), now())
    `;

    db.query(sql, [user_id, store_id, total_price, status], (err, results) => {
      if (err) {
        console.error("Error creating order:", err);
        return callback(err, null);
      }

      // Trả về order_id
      callback(null, results.insertId);
    });
  },
};

module.exports = Order;