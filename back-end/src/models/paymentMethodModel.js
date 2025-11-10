const db = require("../config/db");

const PaymentMethod = {
  getByName: (name, callback) => {
    const sql = "SELECT payment_method_id FROM paymentmethods WHERE name = ?";
    db.query(sql, [name], (err, results) => {
      if (err) return callback(err, null);
      if (results.length === 0) return callback(null, null);
      callback(null, results[0]);
    });
  },
};

module.exports = PaymentMethod;