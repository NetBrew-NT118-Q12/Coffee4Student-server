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

  // Lấy tất cả item của một user cụ thể
  getByUserId: (userId, callback) => {
    const sql = `
      SELECT 
        oi.order_item_id,
        oi.order_id,
        oi.product_id,
        p.name as product_name,
        oi.quantity,
        oi.unit_price,
        oi.subtotal,
        oi.variant_selection,
        oi.note
      FROM orderitems oi
      JOIN orders o ON oi.order_id = o.order_id
      LEFT JOIN products p ON oi.product_id = p.product_id
      WHERE o.user_id = ?
    `;

    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error("Error fetching order items by user:", err);
        return callback(err, null);
      }
      
      // Parse JSON variant_selection nếu cần (mysql driver có thể tự làm, nhưng an toàn thì check)
      const parsedResults = results.map(item => ({
         ...item,
         variant_selection: (typeof item.variant_selection === 'string') 
            ? JSON.parse(item.variant_selection) 
            : item.variant_selection
      }));

      callback(null, parsedResults);
    });
  }
};

module.exports = OrderItem;