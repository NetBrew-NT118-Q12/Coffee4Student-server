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
        -- Đếm số sản phẩm
        COUNT(DISTINCT oi.product_id) as product_count,
        -- Lấy danh sách sản phẩm (dùng GROUP_CONCAT để gom thành chuỗi)
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

      // ✅ Parse products_data thành array
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

        // Xóa products_data và trả về products array
        delete order.products_data;
        order.products = products;

        return order;
      });

      callback(null, parsedResults);
    });
  },

  // ✅ SỬA: Lấy lịch sử review với JOIN
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
};

module.exports = Feedback;