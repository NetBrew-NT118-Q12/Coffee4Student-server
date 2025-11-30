const Order = require("../models/orderModel");
const OrderItem = require("../models/orderItemModel");

const createOrder = (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "No order items provided" });
  }

  const { user_id, store_id, delivery_type } = items[0];
  const total_price = items.reduce((sum, i) => sum + Number(i.subtotal || 0), 0);

  // Tạo timestamp hiện tại
  const now = new Date();
  const created_at = now.toISOString().slice(0, 16).replace("T", " "); // YYYY-MM-DD HH:mm

  // Lấy giờ và phút để trả về cho app — HH:mm
  const created_time = now.toTimeString().slice(0, 5);

  // Tạo Order trước
  Order.create(
    {
      user_id,
      store_id,
      total_price,
      status: "pending",
      delivery_type,
    },
    (err, orderId) => {
      if (err) {
        console.error("Create Order Error:", err);
        return res.status(500).json({
          message: "Failed to create order",
          error: err.message,
        });
      }

      // Sau đó insert danh sách OrderItem
      OrderItem.bulkInsert(orderId, items, (err2) => {
        if (err2) {
          const db = require("../config/db");
          db.query("DELETE FROM orders WHERE order_id = ?", [orderId], (rollbackErr) => {
            if (rollbackErr) {
              console.error("Rollback Order Error:", rollbackErr);
            }
            return res.status(500).json({
              message: "Failed to insert order items",
              error: err2.message,
            });
          });
          return;
        }

        // Thành công
        return res.status(200).json({
          message: "Order created successfully",
          order_id: orderId,
          total_price,
          status: "pending",
          created_time,
          created_at,
        });
      });
    }
  );
};

const cancelOrder = (req, res) => {
  const orderId = req.params.id;

  if (!orderId) {
    return res.status(400).json({ success: false, message: "Order ID is required" });
  }

  // Tạo timestamp hiện tại
  const now = new Date();
  const updated_time = now.toTimeString().slice(0, 5); // HH:mm
  const updated_at = now.toISOString().slice(0, 16).replace("T", " "); // YYYY-MM-DD HH:mm

  Order.cancel(orderId, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to cancel order",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.json({
      success: true,
      status: "cancelled",
      updated_time,
      updated_at,
    });
  });
};

module.exports = { createOrder, cancelOrder };