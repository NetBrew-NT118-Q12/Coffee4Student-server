const Order = require("../models/orderModel");
const OrderItem = require("../models/orderItemModel");

const createOrder = (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "No order items provided" });
  }

  const { user_id, store_id } = items[0];
  const total_price = items.reduce((sum, i) => sum + Number(i.subtotal || 0), 0);

  // 1️⃣ Tạo Order trước
  Order.create(
    {
      user_id,
      store_id,
      total_price,
      status: "pending",
    },
    (err, orderId) => {
      if (err) {
        console.error("❌ Create Order Error:", err);
        return res.status(500).json({
          message: "Failed to create order",
          error: err.message,
        });
      }

      // 2️⃣ Sau đó insert danh sách OrderItem
      OrderItem.bulkInsert(orderId, items, (err2) => {
        if (err2) {
          const db = require("../config/db");
          db.query("DELETE FROM orders WHERE order_id = ?", [orderId], (rollbackErr) => {
            if (rollbackErr) {
              console.error("⚠️ Rollback Order Error:", rollbackErr);
            }
            return res.status(500).json({
              message: "Failed to insert order items",
              error: err2.message,
            });
          });
          return;
        }

        // ✅ Thành công
        return res.status(200).json({
          message: "Order created successfully",
          order_id: orderId,
          store_id,
          total_price,
          status: "pending",
        });
      });
    }
  );
};

module.exports = { createOrder };