// controllers/feedbackController.js - FIXED VERSION
const Feedback = require("../models/feedbackModel");

exports.createFeedback = (req, res) => {
  const { order_id, user_id, product_id, star, content } = req.body;

  // ✅ Validate đầy đủ
  if (!order_id || !user_id || !star) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin bắt buộc (order_id, user_id, star)",
    });
  }

  if (star < 1 || star > 5 || isNaN(star)) {
    return res.status(400).json({
      success: false,
      message: "Sao phải là số từ 1 đến 5",
    });
  }

  // ✅ Kiểm tra đã review chưa
  Feedback.checkIfReviewed(order_id, (err, isReviewed) => {
    if (err) {
      console.error("❌ DB Error:", err);
      return res.status(500).json({
        success: false,
        message: "Lỗi kiểm tra đánh giá",
      });
    }

    if (isReviewed) {
      return res.status(409).json({
        success: false,
        message: "Đơn hàng đã được đánh giá rồi",
      });
    }

    const data = {
      order_id: parseInt(order_id),
      user_id: parseInt(user_id),
      product_id: product_id ? parseInt(product_id) : null,
      star: parseInt(star),
      content: content ? content.trim() : "",
    };

    // ✅ Tạo feedback
    Feedback.create(data, (err, result) => {
      if (err) {
        console.error("❌ Create Feedback Error:", err);
        return res.status(500).json({
          success: false,
          message: "Không thể tạo đánh giá",
          error: err.message,
        });
      }

      // ✅ Đánh dấu đã review
      Feedback.markOrderAsReviewed(order_id, (markErr) => {
        if (markErr) {
          console.error("⚠️ Mark Error:", markErr);
        }
      });

      res.json({
        success: true,
        message: "Đánh giá thành công!",
        feedback_id: result.insertId,
      });
    });
  });
};

// ✅ FIX: Lịch sử đánh giá
exports.getReviewHistory = (req, res) => {
  const user_id = parseInt(req.params.user_id);

  if (!user_id || isNaN(user_id)) {
    return res.status(400).json({
      success: false,
      message: "user_id không hợp lệ",
    });
  }

  Feedback.getByUserId(user_id, (err, results) => {
    if (err) {
      console.error("❌ Get Review History Error:", err);
      return res.status(500).json({
        success: false,
        message: "Lỗi tải lịch sử đánh giá",
      });
    }

    res.json({
      success: true,
      count: results.length,
      reviews: results,
    });
  });
};

// back-end/src/controllers/feedbackController.js
exports.getUnreviewedOrders = (req, res) => {
  const user_id = parseInt(req.params.user_id);

  if (!user_id || isNaN(user_id)) {
    return res.status(400).json({
      success: false,
      message: "user_id không hợp lệ",
    });
  }

  Feedback.getUnreviewedOrders(user_id, (err, results) => {
    if (err) {
      console.error("❌ Get Unreviewed Orders Error:", err);
      return res.status(500).json({
        success: false,
        message: "Lỗi tải đơn hàng chưa đánh giá",
      });
    }

    // ✅ Data đã được parse trong model, trả về trực tiếp
    res.json({
      success: true,
      count: results.length,
      orders: results
    });
  });
};