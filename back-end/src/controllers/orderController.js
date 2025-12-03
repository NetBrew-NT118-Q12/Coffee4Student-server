const axios = require("axios");
const Order = require("../models/orderModel");
const OrderItem = require("../models/orderItemModel");

const N8N_WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook/order-created";

const createOrder = (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "No order items provided" });
  }

  const { user_id, store_id, delivery_type } = items[0];
  const total_price = items.reduce(
    (sum, i) => sum + Number(i.subtotal || 0),
    0
  );

  const now = new Date();
  const created_at = now.toISOString().slice(0, 16).replace("T", " ");
  const created_time = now.toTimeString().slice(0, 5);

  // Tạo order
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

      // Insert Order Items
      OrderItem.bulkInsert(orderId, items, async (err2) => {
        if (err2) {
          const db = require("../config/db");

          // Rollback order
          db.query(
            "DELETE FROM orders WHERE order_id = ?",
            [orderId],
            (rollbackErr) => {
              if (rollbackErr) {
                console.error("Rollback Order Error:", rollbackErr);
              }

              return res.status(500).json({
                message: "Failed to insert order items",
                error: err2.message,
              });
            }
          );

          return;
        }

        // Gửi webhook cho n8n
        try {
          await axios.post(
            N8N_WEBHOOK_URL,
            {
              order_id: orderId,
              user_id,
              store_id,
              total_price,
              created_at,
              created_time,
            },
            { timeout: 5000 }
          );

          console.log(`✅ n8n webhook triggered for order ${orderId}`);
        } catch (webhookError) {
          console.error("⚠️ n8n webhook error:", webhookError.message);
        }

        // Trả về client
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

module.exports = { createOrder };
