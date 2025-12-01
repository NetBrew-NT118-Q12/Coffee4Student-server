const express = require("express");
const router = express.Router();
const axios = require("axios");

// URL của AI service (chạy local)
const AI_SERVICE_URL = "http://127.0.0.1:5001";

/**
 * POST /api/recommendations
 * Forward request sang AI service
 */
router.post("/", async (req, res) => {
    try {
        const { user_id, product_id, top_n } = req.body;

        // Validate input
        if (!user_id || !product_id) {
            return res.status(400).json({
                success: false,
                message: "Missing user_id or product_id"
            });
        }

        // Gọi AI service
        const aiResponse = await axios.post(
            `${AI_SERVICE_URL}/api/recommendations`,
            {
                user_id,
                product_id,
                top_n: top_n || 6
            },
            {
                timeout: 30000 // 30 giây timeout
            }
        );

        // Trả về kết quả từ AI
        res.json(aiResponse.data);

    } catch (error) {
        console.error("❌ AI Service Error:", error.message);

        // Xử lý lỗi
        if (error.response) {
            // AI service trả về lỗi
            res.status(error.response.status).json({
                success: false,
                message: error.response.data.message || "AI service error"
            });
        } else if (error.code === "ECONNREFUSED") {
            // AI service không chạy
            res.status(503).json({
                success: false,
                message: "AI service unavailable"
            });
        } else {
            // Lỗi khác
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
});

module.exports = router;
