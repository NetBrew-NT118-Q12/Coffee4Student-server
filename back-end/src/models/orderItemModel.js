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
  getByOrderId: (order_id, callback) => {
    const sql = `
    SELECT 
      oi.order_item_id,
      oi.product_id,
      oi.quantity,
      oi.unit_price,
      oi.subtotal,
      oi.variant_selection,
      oi.note,
      p.name,
      p.price,
      p.image_url,
      p.category_id
    FROM orderitems oi
    JOIN products p ON oi.product_id = p.product_id
    WHERE oi.order_id = ?
  `;

    db.query(sql, [order_id], callback);
  },
};

module.exports = OrderItem;