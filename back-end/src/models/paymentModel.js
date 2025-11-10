const db = require("../config/db");

const Payment = {
  create: (data, callback) => {
    const { order_id, payment_method_id, amount, status } = data;
    const sql = `
      INSERT INTO payments (order_id, payment_method_id, amount, status)
      VALUES (?, ?, ?, ?)
    `;
    db.query(sql, [order_id, payment_method_id, amount, status], (err, result) => {
      if (err) return callback(err, null);
      callback(null, { payment_id: result.insertId });
    });
  },
};

module.exports = Payment;