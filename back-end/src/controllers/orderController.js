const axios = require("axios");
const Order = require("../models/orderModel");
const OrderItem = require("../models/orderItemModel");
const Voucher = require("../models/voucherModel");
const UserModel = require("../models/userModel");
const NotificationModel = require("../models/notificationModel")
const admin = require("../config/firebase");

// --- BIẾN LƯU TRỮ CÁC TIMER MÔ PHỎNG ---
// Cấu trúc: { order_id: [timerId1, timerId2, timerId3] }
const activeSimulations = {};

function formatLocalDateTimeToSqlFormat(dateObj) {
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const seconds = dateObj.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Hàm phụ: Cập nhật trạng thái DB -> Lấy Token -> Gửi Thông báo
const updateStatusAndNotify = (orderId, userId, newStatus, title, body) => {
    Order.updateStatus(orderId, newStatus, (err, data) => {
        if (err) {
            console.error(`Error updating order ${orderId} to ${newStatus}:`, err);
            return;
        }
        console.log(`Order ${orderId} updated to: ${newStatus}`);

        const timeInfo = data.updatedData || {};
        const timeAt = timeInfo.completed_at || timeInfo.updated_at || "";

        UserModel.getFcmTokenByUserId(userId, (err2, fcmToken) => {
            if (err2 || !fcmToken) {
                console.log(`User ${userId} has no token or error fetching token.`);
                return;
            }

            const message = {
                notification: { title: title, body: body },
                data: {
                    order_id: String(orderId),
                    type: "order",
                    time_at: timeAt,
                    status: newStatus
                },
                token: fcmToken,
            };

            admin.messaging().send(message)
                .then((response) => console.log(`Notification sent for ${newStatus}`))
                .catch((error) => console.log("Error sending notification:", error));
        });

        const now = new Date();
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
            if (errNoti) console.error("Error saving notification to DB:", errNoti);
        });
    });
};

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook/order-created";

const getOrderDetails = (req, res) => {
    const orderId = req.params.id;
    Order.getById(orderId, (err, orderData) => {
        if (err) return res.status(500).json({ message: "Lỗi lấy order", error: err });
        if (!orderData.length) return res.status(404).json({ message: "Order không tồn tại" });
        const order = orderData[0];
        OrderItem.getByOrderId(orderId, (errItems, items) => {
            if (errItems) return res.status(500).json({ message: "Lỗi lấy order items", error: errItems });
            res.status(200).json({ ...order, items });
        });
    });
};

// ✅ Hàm tạo đơn hàng (Đã chỉnh sửa để lưu Timer)
const createOrder = (req, res) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "No order items provided" });
    }

    const { user_id, store_id, delivery_type, vc_user_id, discount_amount } = items[0];
    const total_price = items.reduce((sum, i) => sum + Number(i.subtotal || 0), 0) - discount_amount;

    Order.create(
        { user_id, store_id, total_price, status: "pending", delivery_type, vc_user_id, discount_amount },
        (err, orderData) => {
            if (err) return res.status(500).json({ message: "Failed to create order", error: err.message });

            const { order_id, created_at } = orderData;

            OrderItem.bulkInsert(order_id, items, async (err2) => {
                if (err2) {
                    const db = require("../config/db");
                    db.query("DELETE FROM orders WHERE order_id = ?", [order_id], (rollbackErr) => {
                         if (rollbackErr) console.error("Rollback Order Error:", rollbackErr);
                         return res.status(500).json({ message: "Failed to insert order items", error: err2.message });
                    });
                    return;
                }

                if (vc_user_id && vc_user_id > 0) {
                    Voucher.markAsUsed(vc_user_id, user_id, (vErr) => {
                        if (vErr) console.error("Warning: Failed to mark voucher as used", vErr);
                    });
                }

                try {
                    await axios.post(N8N_WEBHOOK_URL, {
                        order_id, user_id, store_id, total_price, created_at, status: "completed",
                    }, { timeout: 25000 });
                    console.log(`✅ n8n webhook triggered for order ${order_id}`);
                } catch (webhookError) {
                    console.error("⚠️ n8n webhook error:", webhookError.message);
                }

                res.status(200).json({
                    message: "Order created successfully",
                    order_id, total_price, status: "pending", created_at,
                });

                // --- BẮT ĐẦU QUY TRÌNH GIẢ LẬP TRẠNG THÁI (CÓ QUẢN LÝ) ---
                
                // Khởi tạo mảng chứa timer cho đơn hàng này
                activeSimulations[order_id] = [];

                const t1 = setTimeout(() => {
                    updateStatusAndNotify(order_id, user_id, "preparing", "Đơn hàng đang pha chế ☕", "Đơn hàng #" + order_id + " đang được chuẩn bị cho bạn.");
                }, 10000);
                activeSimulations[order_id].push(t1);

                const t2 = setTimeout(() => {
                    updateStatusAndNotify(order_id, user_id, "ready", "Đơn hàng đã sẵn sàng! 🥤", "Đơn hàng của bạn #" + order_id + " đã được pha chế xong. Hãy đến nhận nhé!");
                }, 20000);
                activeSimulations[order_id].push(t2);

                const t3 = setTimeout(() => {
                    updateStatusAndNotify(order_id, user_id, "completed", "Hoàn tất đơn hàng ✅", "Đơn hàng #" + order_id + " đã được lấy, cảm ơn bạn đã sử dụng dịch vụ. Hẹn gặp lại!");
                    // Khi hoàn thành hết, xóa khỏi bộ nhớ để tránh rác
                    delete activeSimulations[order_id];
                }, 25000);
                activeSimulations[order_id].push(t3);
            });
        }
    );
};

const getOrdersByUserId = (req, res) => {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });
    Order.getAllByUserId(userId, (err, orders) => {
        if (err) return res.status(500).json({ success: false, message: "Failed to fetch orders", error: err.message });
        res.json(orders);
    });
};

// ✅ Hàm hủy đơn hàng (Đã chỉnh sửa để HỦY Timer)
const cancelOrder = (req, res) => {
    const orderId = req.params.id;

    if (!orderId) {
        return res.status(400).json({ success: false, message: "Missing order_id" });
    }

    Order.cancel(orderId, (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Failed to cancel order" });
        }

        if (result.notFound) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // --- QUAN TRỌNG: HỦY MÔ PHỎNG NẾU ĐANG CHẠY ---
        if (activeSimulations[orderId]) {
            console.log(`🛑 Stopping simulation for canceled Order #${orderId}`);
            // Duyệt qua tất cả các timer ID đã lưu và xóa chúng
            activeSimulations[orderId].forEach((timerId) => clearTimeout(timerId));
            // Xóa key khỏi object để giải phóng bộ nhớ
            delete activeSimulations[orderId];
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
        if (err) return res.status(500).json({ success: false, message: "Failed to fetch all orders", error: err.message });
        res.status(200).json(orders);
    });
};

module.exports = { createOrder, cancelOrder, getOrdersByUserId, getOrderDetails, getAllOrders };