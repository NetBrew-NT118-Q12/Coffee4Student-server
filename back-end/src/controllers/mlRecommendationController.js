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

/**
 * Hybrid: Kết hợp ML predictions với rule-based recommendations
 */
const getHybridRecommendations = async (req, res) => {
  try {
    const { user_id, product_id, store_id, weather_temp, weather_condition, top_n } = req.body;

    if (!user_id || !product_id) {
      return res.status(400).json({
        success: false,
        message: "Missing user_id or product_id",
      });
    }

    const db = require("../config/db");
    const axios = require("axios");

    // 1. Gọi ML model
    let mlPrediction = null;
    try {
      const mlResponse = await axios.post(
        SAGEMAKER_API_URL,
        {
          user_id: parseInt(user_id),
          store_id: parseInt(store_id) || 1,
          weather_temp: parseFloat(weather_temp) || 28,
          weather_condition: weather_condition || "Sunny",
          hour: new Date().getHours(),
        },
        { timeout: 10000 }
      );
      mlPrediction = mlResponse.data.predicted_product_id;
    } catch (error) {
      console.warn("⚠️ ML prediction failed, using rule-based fallback");
    }

    // 2. Gọi AI recommendation hiện tại (Python service)
    const AI_API_URL = process.env.AI_API_URL || "http://127.0.0.1:5001";
    const aiResponse = await axios.post(
      `${AI_API_URL}/api/recommendations`,
      {
        user_id: parseInt(user_id),
        product_id: parseInt(product_id),
        top_n: parseInt(top_n) || 5,
      },
      { timeout: 10000 }
    );

    // 3. Merge kết quả
    const recommendations = aiResponse.data.recommendations || [];

    // Nếu có ML prediction và chưa có trong list, thêm vào top
    if (mlPrediction && !recommendations.find((r) => r.product_id === mlPrediction)) {
      // Lấy thông tin product
      db.query(
        "SELECT product_id, name, category_id FROM products WHERE product_id = ?",
        [mlPrediction],
        (err, results) => {
          if (!err && results.length > 0) {
            recommendations.unshift({
              ...results[0],
              final_score: 0.95,
              method: "ml-prediction",
            });
          }

          return res.json({
            success: true,
            recommendations: recommendations.slice(0, top_n || 6),
            method_used: "hybrid-ml-ai",
            ml_prediction: mlPrediction,
            ai_count: aiResponse.data.count,
          });
        }
      );
    } else {
      return res.json({
        success: true,
        recommendations: recommendations,
        method_used: aiResponse.data.method_used,
        ml_prediction: mlPrediction,
      });
    }
  } catch (error) {
    console.error("❌ Hybrid recommendation error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Recommendation service error",
      error: error.message,
    });
  }
};

module.exports = { getMLRecommendations, getHybridRecommendations };

