const express = require("express");
const router = express.Router();
const axios = require("axios");
// URL AI service (chạy local trên VPS)
const AI_API_URL = process.env.AI_API_URL || "http://127.0.0.1:5001";

/**
 * POST /api/recommendations
 * Body: { user_id, product_id, top_n }
 */
router.post("/", async (req, res) => {
  try {
    const { user_id, product_id, top_n } = req.body;

    // Validate
    if (!user_id || !product_id) {
      return res.status(400).json({
        success: false,
        message: "Missing user_id or product_id",
      });
    }

    console.log(`📤 Calling AI API: user=${user_id}, product=${product_id}`);

    // Gọi Python AI service
    const response = await axios.post(
      `${AI_API_URL}/api/recommendations`,
      {
        user_id: parseInt(user_id),
        product_id: parseInt(product_id),
        top_n: parseInt(top_n) || 6,
      },
      {
        timeout: 10000, // 10s timeout
      }
    );

    console.log("✅ AI API responded successfully");

    // Trả về kết quả
    return res.json(response.data);
  } catch (error) {
    console.error("❌ AI API Error:", error.message);

    // Xử lý lỗi chi tiết
    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        message: "AI service is not running",
      });
    }

    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    return res.status(500).json({
      success: false,
      message: "AI service error",
      error: error.message,
    });
  }

});

module.exports = router;
