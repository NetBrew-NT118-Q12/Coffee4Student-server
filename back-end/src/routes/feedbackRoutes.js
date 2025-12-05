const express = require("express");
const router = express.Router();
const {
  createFeedback,
  getReviewHistory,
  getUnreviewedOrders
} = require("../controllers/feedbackController");

// POST /api/feedbacks - Tạo đánh giá mới
router.post("/", createFeedback);

// GET /api/feedbacks/history/:user_id - Lịch sử đánh giá
router.get("/history/:user_id", getReviewHistory);

// GET /api/feedbacks/unreviewed/:user_id - Đơn hàng chưa đánh giá
router.get("/unreviewed/:user_id", getUnreviewedOrders);

module.exports = router;