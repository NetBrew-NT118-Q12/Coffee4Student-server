/**
 * Hybrid: Kết hợp ML predictions với rule-based recommendations
 */
const getHybridRecommendations = async (req, res) => {
  try {
    const {
      user_id,
      product_id,
      store_id,
      weather_temp,
      weather_condition,
      top_n,
    } = req.body;

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
    if (
      mlPrediction &&
      !recommendations.find((r) => r.product_id === mlPrediction)
    ) {
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
