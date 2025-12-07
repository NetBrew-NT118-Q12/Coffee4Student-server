// back-end/src/models/feedbackModel.js - UPDATED VERSION
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

  // ✅ NEW: Lấy lịch sử review với products
  getReviewHistoryWithProducts: (user_id, callback) => {
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
        COUNT(DISTINCT oi.product_id) as product_count,
        GROUP_CONCAT(
          CONCAT_WS('|', 
            oi.product_id,
            p.name,
            oi.quantity,
            oi.unit_price,
            oi.subtotal,
            COALESCE(p.image_url, ''),
            COALESCE(oi.variant_selection, '[]'),
            COALESCE(oi.note, '')
          ) 
          SEPARATOR ':::'
        ) as products_data
      FROM feedbacks f
      INNER JOIN orders o ON f.order_id = o.order_id
      INNER JOIN stores s ON o.store_id = s.store_id
      LEFT JOIN orderitems oi ON o.order_id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.product_id
      WHERE f.user_id = ?
      GROUP BY f.feedback_id, f.order_id, f.star, f.content, 
               f.created_at, s.store_name, o.total_price, o.created_at
      ORDER BY f.created_at DESC
    `;

    db.query(sql, [user_id], (err, results) => {
      if (err) return callback(err);

      // ✅ Parse products_data thành JSON array
      const parsedResults = results.map((review) => {
        const products = [];

        if (review.products_data) {
          const productStrings = review.products_data.split(":::");
          productStrings.forEach((prodStr) => {
            const [
              product_id,
              name,
              quantity,
              unit_price,
              subtotal,
              image_url,
              variant_selection,
              note,
            ] = prodStr.split("|");

            products.push({
              product_id: parseInt(product_id),
              product_name: name,
              quantity: parseInt(quantity),
              unit_price: parseFloat(unit_price),
              subtotal: parseFloat(subtotal),
              image_url: image_url || "",
              variant_selection: variant_selection || "[]",
              note: note || "",
            });
          });
        }

        // ✅ Return với products array dưới dạng JSON string
        return {
          feedback_id: review.feedback_id,
          order_id: review.order_id,
          star: review.star,
          content: review.content,
          created_at: review.created_at,
          store_name: review.store_name,
          total_price: review.total_price,
          order_date: review.order_date,
          product_count: review.product_count,
          products: JSON.stringify(products), // ✅ Convert to JSON string
        };
      });

      callback(null, parsedResults);
    });
  },

  // ✅ Keep original method for backward compatibility
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
        COUNT(DISTINCT oi.product_id) as product_count
      FROM feedbacks f
      INNER JOIN orders o ON f.order_id = o.order_id
      INNER JOIN stores s ON o.store_id = s.store_id
      LEFT JOIN orderitems oi ON o.order_id = oi.order_id
      WHERE f.user_id = ?
      GROUP BY f.feedback_id, f.order_id, f.star, f.content, 
               f.created_at, s.store_name, o.total_price, o.created_at
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
        s.store_name,
        o.total_price,
        o.created_at,
        o.status,
        o.delivery_type,
        COUNT(DISTINCT oi.product_id) as product_count,
        GROUP_CONCAT(
          CONCAT_WS('|', 
            oi.product_id,
            p.name,
            oi.quantity,
            oi.unit_price,
            oi.subtotal,
            COALESCE(p.image_url, ''),
            COALESCE(oi.variant_selection, '[]'),
            COALESCE(oi.note, '')
          ) 
          SEPARATOR ':::'
        ) as products_data
      FROM orders o
      INNER JOIN stores s ON o.store_id = s.store_id
      LEFT JOIN orderitems oi ON o.order_id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.product_id
      WHERE o.user_id = ? 
        AND o.status = 'completed' 
        AND (o.reviewed = 0 OR o.reviewed IS NULL)
      GROUP BY o.order_id, o.user_id, o.store_id, s.store_name, 
               o.total_price, o.created_at, o.status, o.delivery_type
      ORDER BY o.created_at DESC
    `;

    db.query(sql, [user_id], (err, results) => {
      if (err) return callback(err);

      const parsedResults = results.map((order) => {
        const products = [];
        if (order.products_data) {
          const productStrings = order.products_data.split(":::");
          productStrings.forEach((prodStr) => {
            const [
              product_id,
              name,
              quantity,
              unit_price,
              subtotal,
              image_url,
              variant_selection,
              note,
            ] = prodStr.split("|");

            products.push({
              product_id: parseInt(product_id),
              product_name: name,
              quantity: parseInt(quantity),
              unit_price: parseFloat(unit_price),
              subtotal: parseFloat(subtotal),
              image_url: image_url || "",
              variant_selection: variant_selection || "[]",
              note: note || "",
            });
          });
        }

        delete order.products_data;
        order.products = products;

        return order;
      });

      callback(null, parsedResults);
    });
  },
};

module.exports = Feedback;
