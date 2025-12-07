const db = require("../config/db");

function formatTime(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  date.setHours(date.getHours());
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const Order = {
  create: (data, callback) => {
    const { user_id, store_id, total_price, status , delivery_type, vc_user_id, discount_amount} = data;

    const sql = `
      INSERT INTO orders (user_id, store_id, total_price, status, delivery_type, created_at, updated_at, vc_user_id, discount_amount)
      VALUES (?, ?, ?, ?, ?, now(), now(), ?, ?)
    `;

    db.query(sql, [user_id, store_id, total_price, status, delivery_type, vc_user_id, discount_amount], (err, results) => {
      if (err) {
        console.error("Error creating order:", err);
        return callback(err, null);
      }

      const order_id = results.insertId;

      db.query(
        "SELECT created_at FROM orders WHERE order_id = ?",
        [order_id],
        (err2, rows) => {
          if (err2) return callback(err2, null);

          callback(null, {
            order_id: order_id,
            created_at: formatTime(rows[0].created_at),
          });
        }
      );
    });
  },

  getAllByUserId: (userId, callback) => {
    const query = `
      SELECT 
        o.order_id, 
        o.user_id, 
        o.store_id, 
        s.store_name, 
        o.total_price, 
        o.status, 
        o.delivery_type,
        pm.name as payment_method,
        o.created_at, 
        o.updated_at, 
        o.completed_at
      FROM orders o
      LEFT JOIN stores s ON o.store_id = s.store_id
      LEFT JOIN payments p ON o.order_id = p.order_id
      LEFT JOIN paymentmethods pm ON p.payment_method_id = pm.payment_method_id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `;

    db.query(query, [userId], (err, results) => {
      if (err) return callback(err, null);

      // FORMAT TẤT CẢ THỜI GIAN VỀ GIỜ VIỆT NAM TRƯỚC KHI TRẢ VỀ
      const formattedResults = results.map(order => ({
        ...order,
        created_at: formatTime(order.created_at),
        updated_at: formatTime(order.updated_at),
        completed_at: formatTime(order.completed_at),
      }));

      callback(null, formattedResults);
    });
  },

updateStatus: (orderId, status, callback) => {

    let query = "";
    let params = [];
    let timeField = ""; // completed_at hoặc updated_at

    if (status === 'completed') {
        query = "UPDATE orders SET status = ?, completed_at = NOW() WHERE order_id = ?";
        params = [status, orderId];
        timeField = "completed_at";
    } else {
        // pending, preparing, ready, cancelled...
        query = "UPDATE orders SET status = ?, updated_at = NOW() WHERE order_id = ?";
        params = [status, orderId];
        timeField = "updated_at";
    }

    db.query(query, params, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        const selectQuery = `
            SELECT status, completed_at, updated_at
            FROM orders
            WHERE order_id = ?
        `;

        db.query(selectQuery, [orderId], (err2, rows) => {
            if (err2) {
                return callback(err2, null);
            }

            if (rows.length === 0) {
                return callback(null, { message: "Order not found" });
            }

            const order = rows[0];

            return callback(null, {
                result: result,
                updatedData: {
                    status: order.status,
                    [timeField]: formatTime(order[timeField])
                }
            });
        });
    });
},

cancel: (orderId, callback) => {
    const sqlUpdate = `
      UPDATE orders
      SET status = 'cancelled', updated_at = NOW()
      WHERE order_id = ?
    `;

    db.query(sqlUpdate, [orderId], (err, result) => {
        if (err) return callback(err, null);

        if (result.affectedRows === 0) {
            return callback(null, { notFound: true });
        }

        // SELECT lại để lấy updated_at từ DB
        const sqlSelect = `
            SELECT status, updated_at
            FROM orders
            WHERE order_id = ?
        `;

        db.query(sqlSelect, [orderId], (err2, rows) => {
            if (err2) return callback(err2, null);

            callback(null, {
                status: rows[0].status,
                updated_at: formatTime(rows[0].updated_at)
            });
        });
    });
},
};

module.exports = Order;