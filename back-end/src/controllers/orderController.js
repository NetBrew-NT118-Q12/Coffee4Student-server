const axios = require("axios");
const Order = require("../models/orderModel");
const OrderItem = require("../models/orderItemModel");
const Voucher = require("../models/voucherModel");
const UserModel = require("../models/userModel");
const NotificationModel = require("../models/notificationModel")
const admin = require("../config/firebase");

function formatLocalDateTimeToSqlFormat(dateObj) {
    // Lấy các thành phần ngày, tháng, năm địa phương
    const year = dateObj.getFullYear();
    // getMonth() trả về giá trị từ 0-11, nên cần cộng thêm 1
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');

    // Lấy các thành phần giờ, phút, giây địa phương
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const seconds = dateObj.getSeconds().toString().padStart(2, '0');

    // Kết hợp thành chuỗi định dạng mong muốn
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Hàm phụ: Cập nhật trạng thái DB -> Lấy Token -> Gửi Thông báo
const updateStatusAndNotify = (orderId, userId, newStatus, title, body) => {
  // 1. Cập nhật Database
  Order.updateStatus(orderId, newStatus, (err, data) => {
    if (err) {
      console.error(`Error updating order ${orderId} to ${newStatus}:`, err);
      return;
    }
    console.log(`Order ${orderId} updated to: ${newStatus}`);

    // data.updatedData chứa: status, [updated_at hoặc completed_at], time_display
    const timeInfo = data.updatedData || {}; 
    
    // Xác định timestamp cụ thể để gửi
    const timeAt = timeInfo.completed_at || timeInfo.updated_at || "";

    // 2. Lấy Token người dùng
    UserModel.getFcmTokenByUserId(userId, (err2, fcmToken) => {
      if (err2 || !fcmToken) {
        console.log(`User ${userId} has no token or error fetching token.`);
        return;
      }

      // 3. Gửi thông báo
      const message = {
        notification: {
          title: title,
          body: body,
        },
        data: {
          order_id: String(orderId),
          type: "order", // Để app biết điều hướng vào tab đơn hàng
          time_at: timeAt,
          status: newStatus
        },
        token: fcmToken,
      };

      admin.messaging().send(message)
        .then((response) => console.log(`Notification sent for ${newStatus}`))
        .catch((error) => console.log("Error sending notification:", error));
    });

    // LƯU THÔNG BÁO VÀO DATABASE
    // Tạo thời gian hiện tại
    const now = new Date();
    // Format YYYY-MM-DD HH:mm:ss cho MySQL
    const created_at = formatLocalDateTimeToSqlFormat(now);

    const notiData = {
      user_id: userId,
      title: title,
      message: body,
      created_at: created_at,
      type: 'order',
      is_read: false
    };

    NotificationModel.create(notiData, (errNoti, resNoti) => {
        if (errNoti) {
            console.error("Error saving notification to DB:", errNoti);
        } else {
            console.log("Notification saved to DB successfully.");
        }
    });
  });
};


const N8N_WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook/order-created";


const getOrderDetails = (req, res) => {
  const orderId = req.params.id;

  Order.getById(orderId, (err, orderData) => {
    if (err) {
      return res.status(500).json({ message: "Lỗi lấy order", error: err });
    }

    if (!orderData.length) {
      return res.status(404).json({ message: "Order không tồn tại" });
    }

    const order = orderData[0];

    // Lấy danh sách items
    OrderItem.getByOrderId(orderId, (errItems, items) => {
      if (errItems) {
        return res
          .status(500)
          .json({ message: "Lỗi lấy order items", error: errItems });
      }

      res.status(200).json({
        ...order,
        items,
      });
    });
  });
};



// ✅ Hàm tạo đơn hàng
const createOrder = (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "No order items provided" });
  }

  const { user_id, store_id, delivery_type, vc_user_id, discount_amount } = items[0];
  const total_price = items.reduce((sum, i) => sum + Number(i.subtotal || 0), 0) - discount_amount;


  Order.create(
    {
      user_id,
      store_id,
      total_price,
      status: "pending",
      delivery_type,
      vc_user_id,
      discount_amount
    },
    (err, orderData) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to create order",
          error: err.message,
        });
      }

      const { order_id, created_at } = orderData;

      // Sau đó insert danh sách OrderItem
      OrderItem.bulkInsert(order_id, items, async (err2) => {
        if (err2) {
          const db = require("../config/db");
          db.query("DELETE FROM orders WHERE order_id = ?", [order_id], (rollbackErr) => {
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

        if (vc_user_id && vc_user_id > 0) {
          // ĐỔI VoucherUsage.markAsUsed THÀNH Voucher.markAsUsed
          Voucher.markAsUsed(vc_user_id, user_id, (vErr, vData) => {
              if (vErr) {
                  console.error("Warning: Failed to mark voucher as used", vErr);
              }
          });
        }

        // ✅ Gửi webhook cho n8n
        try {
          await axios.post(
            N8N_WEBHOOK_URL,
            {
              order_id: order_id,
              user_id,
              store_id,
              total_price,
              created_at,
              status: "completed", // ← Gửi status mới
            },
            { timeout: 25000 }
          );

          console.log(`✅ n8n webhook triggered for order ${orderId}`);
        } catch (webhookError) {
          console.error("⚠️ n8n webhook error:", webhookError.message);
        }

        // Thành công
        res.status(200).json({
          message: "Order created successfully",
          order_id,
          total_price,
          status: "pending",
          created_at,
        });

        // --- BẮT ĐẦU QUY TRÌNH GIẢ LẬP TRẠNG THÁI (CHẠY NGẦM) ---
        
        // 1. Sau 5s: Chuyển sang "preparing"
        setTimeout(() => {
          updateStatusAndNotify(
            order_id, 
            user_id, 
            "preparing", 
            "Đơn hàng đang pha chế ☕", 
            "Đơn hàng #" + order_id + " đang được chuẩn bị cho bạn."
          );
        }, 10000);

        // 2. Sau 10s tiếp theo (tức là 15s từ lúc đặt): Chuyển sang "ready"
        setTimeout(() => {
          updateStatusAndNotify(
            order_id, 
            user_id, 
            "ready", 
            "Đơn hàng đã sẵn sàng! 🥤", 
            "Đơn hàng của bạn #" + order_id + " đã được pha chế xong. Hãy đến nhận nhé!"
          );
        }, 20000);

        // 3. Sau 5s tiếp theo (tức là 20s từ lúc đặt): Chuyển sang "completed"
        setTimeout(() => {
          updateStatusAndNotify(
            order_id, 
            user_id, 
            "completed", 
            "Hoàn tất đơn hàng ✅", 
            "Đơn hàng #" + order_id + " đã được lấy, cảm ơn bạn đã sử dụng dịch vụ. Hẹn gặp lại!"
          );
        }, 25000);
      });
    }
  );
};

const getOrdersByUserId = (req, res) => {
  const userId  = req.params.userId;

  if (!userId) {
    return res.status(400).json({ 
      success: false, 
      message: "User ID is required" 
    });
  }

  Order.getAllByUserId(userId, (err, orders) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch orders",
        error: err.message,
      });
    }

    res.json(orders);
  });
};

const cancelOrder = (req, res) => {
  const orderId = req.params.id;

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: "Missing order_id",
    });
  }

  Order.cancel(orderId, (err, result) => {
      if (err) {
          return res.status(500).json({
              success: false,
              message: "Failed to cancel order",
          });
      }

      if (result.notFound) {
          return res.status(404).json({
              success: false,
              message: "Order not found",
          });
      }

      return res.json({
          success: true,
          status: result.status,
          updated_at: result.updated_at
      });
  });
};

const getAllOrders = (req, res) => {
  Order.getAll((err, orders) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch all orders",
        error: err.message,
      });
    }
    res.status(200).json(orders);
  });
};

module.exports = { createOrder, cancelOrder, getOrdersByUserId, getOrderDetails, getAllOrders };
