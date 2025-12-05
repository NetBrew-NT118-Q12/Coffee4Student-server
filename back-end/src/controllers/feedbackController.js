// controllers/feedbackController.js
const Feedback = require("../models/feedbackModel");

exports.createFeedback = (req, res) => {
  const { order_id, user_id, product_id, star, content } = req.body;

  if (!order_id || !user_id || !star) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu thông tin bắt buộc" });
  }

  if (star < 1 || star > 5) {
    return res.status(400).json({ success: false, message: "Sao phải từ 1-5" });
  }

  Feedback.checkIfReviewed(order_id, (err, isReviewed) => {
    if (err) return res.status(500).json({ success: false, message: "Lỗi DB" });
    if (isReviewed)
      return res
        .status(409)
        .json({ success: false, message: "Đơn hàng đã được đánh giá" });

    const data = {
      order_id,
      user_id,
      product_id: product_id || null,
      star,
      content: content || "",
    };

    Feedback.create(data, (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({
            success: false,
            message: "Không thể tạo đánh giá",
            error: err.message,
          });
      }

      // Đánh dấu đã review
      Feedback.markOrderAsReviewed(order_id, () => {});

      res.json({
        success: true,
        message: "Đánh giá thành công!",
        feedback_id: result.insertId,
      });
    });
  });
};

exports.getReviewHistory = (req, res) => {
  const user_id = req.params.user_id; // Đúng với route
  Feedback.getByUserId(user_id, (err, results) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, count: results.length, reviews: results });
  });
};

exports.getUnreviewedOrders = (req, res) => {
  const user_id = req.params.user_id;
  Feedback.getUnreviewedOrders(user_id, (err, results) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, count: results.length, orders: results });
  });
};
