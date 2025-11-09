const db = require("../config/db");

const OrderItem = {
  bulkInsert: (order_id, items, callback) => {
    if (!items || !items.length) {
      return callback(null, { message: "No items to insert" });
    }

    const values = items.map((item) => [
      order_id,
      item.product_id,
      item.quantity,
      item.unit_price,
      item.subtotal,
      JSON.stringify(item.variant_selection || {}),
      item.note || null,
    ]);

    const sql = `
      INSERT INTO orderitems (order_id, product_id, quantity, unit_price, subtotal, variant_selection, note)
      VALUES ?
    `;

    db.query(sql, [values], (err, results) => {
      if (err) {
        console.error("Error inserting order items:", err);
        return callback(err, null);
      }

      callback(null, results);
    });
  },
};

module.exports = OrderItem;