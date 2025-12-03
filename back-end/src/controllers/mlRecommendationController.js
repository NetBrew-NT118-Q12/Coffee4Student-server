const axios = require("axios");

const SAGEMAKER_API_URL = process.env.SAGEMAKER_API_URL;

/**
 * Gọi SageMaker API để lấy gợi ý ML-based
 */
const getMLRecommendations = async (req, res) => {
  try {
    const { user_id, store_id, weather_temp, weather_condition, hour, top_n } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "Missing user_id",
      });
    }

    console.log(`🤖 Calling SageMaker API for user ${user_id}`);

    // Gọi SageMaker qua API Gateway
    const response = await axios.post(
      SAGEMAKER_API_URL,
      {
        user_id: parseInt(user_id),
        store_id: parseInt(store_id) || 1,
        weather_temp: parseFloat(weather_temp) || 28,
        weather_condition: weather_condition || "Sunny",
        hour: parseInt(hour) || new Date().getHours(),
        top_n: parseInt(top_n) || 5,
      },
      {
        timeout: 30000, // 30s timeout
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ SageMaker responded:", response.data);

    // Lấy product details từ DB
    const db = require("../config/db");
    const predicted_product_id = response.data.predicted_product_id;

    db.query(
      "SELECT * FROM products WHERE product_id = ?",
      [predicted_product_id],
      (err, results) => {
        if (err) {
          console.error("DB error:", err);
          return res.status(500).json({
            success: false,
            message: "Database error",
          });
        }

        return res.json({
          success: true,
          ml_prediction: response.data,
          product: results[0] || null,
          method: "sagemaker-ml",
        });
      }
    );
  } catch (error) {
    console.error("❌ SageMaker API Error:", error.message);

    if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
      return res.status(503).json({
        success: false,
        message: "SageMaker API unavailable",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "ML service error",
      error: error.message,
    });
  }
};

module.exports = { getMLRecommendations };
