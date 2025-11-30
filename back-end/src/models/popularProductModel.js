const db = require("../config/db");

const PopularProduct = {
  /**
   * Lấy Top sản phẩm bán chạy trong N ngày gần đây
   * @param {number} days - Số ngày tính từ hôm nay (mặc định 30)
   * @param {number} limit - Số lượng sản phẩm trả về (mặc định 10)
   */
  getTopProducts: (days = 30, limit = 10, callback) => {
    const sql = `
      SELECT 
        p.product_id,
        p.name,
        p.description,
        p.price,
        p.old_price,
        p.image_url,
        p.is_new,
        p.category_id,
        SUM(oi.quantity) AS total_sold
      FROM orderitems oi
      INNER JOIN orders o ON oi.order_id = o.order_id
      INNER JOIN products p ON oi.product_id = p.product_id
      WHERE 
        o.status = 'completed' 
        AND o.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        AND p.is_active = 1
      GROUP BY p.product_id
      ORDER BY total_sold DESC
      LIMIT ?
    `;

    db.query(sql, [days, limit], callback);
  },
};

module.exports = PopularProduct;
