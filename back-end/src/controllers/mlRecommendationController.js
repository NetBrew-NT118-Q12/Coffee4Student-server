const axios = require("axios");

const SAGEMAKER_API_URL = process.env.SAGEMAKER_API_URL;

/**
 * 🤖 Gọi SageMaker để lấy gợi ý ML-based sau khi complete order
 * Input: order_id (từ Android)
 * Output: Top N sản phẩm gợi ý
 */
const getMLRecommendations = async (req, res) => {
  try {
    const { order_id, top_n } = req.body;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: "Missing order_id",
      });
    }

    console.log(`🤖 Getting ML recommendations for order ${order_id}`);

    const db = require("../config/db");

    // ✅ BƯỚC 1: Lấy thông tin order + weather
    const orderQuery = `
      SELECT 
        o.order_id,
        o.user_id,
        o.store_id,
        o.created_at,
        ow.temperature,
        ow.weather_condition,
        ow.humidity
      FROM orders o
      LEFT JOIN order_weather ow ON o.order_id = ow.order_id
      WHERE o.order_id = ?
    `;

    db.query(orderQuery, [order_id], async (err, orderResults) => {
      if (err || orderResults.length === 0) {
        console.error("❌ Order not found:", err);
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      const order = orderResults[0];
      const hour = new Date(order.created_at).getHours();

      // ✅ BƯỚC 2: Lấy sản phẩm từ order (để có context)
      const itemsQuery = `
        SELECT product_id
        FROM orderitems
        WHERE order_id = ?
        LIMIT 1
      `;

      db.query(itemsQuery, [order_id], async (err2, itemResults) => {
        if (err2 || itemResults.length === 0) {
          console.error("❌ No items found for order");
          return res.status(404).json({
            success: false,
            message: "No items found for this order",
          });
        }

        const contextProductId = itemResults[0].product_id;

        // ✅ BƯỚC 3: Chuẩn bị payload cho SageMaker
        const sagemakerPayload = {
          user_id: parseInt(order.user_id),
          store_id: parseInt(order.store_id),
          weather_temp: parseFloat(order.temperature) || 28,
          weather_condition: order.weather_condition || "Clear",
          humidity: parseInt(order.humidity) || 75,
          hour: parseInt(hour),
          context_product_id: parseInt(contextProductId),
          top_n: parseInt(top_n) || 5,
        };

        console.log("📤 SageMaker Payload:", sagemakerPayload);

        // ✅ BƯỚC 4: Gọi SageMaker API
        try {
          const response = await axios.post(
            SAGEMAKER_API_URL,
            sagemakerPayload,
            {
              timeout: 30000,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          console.log("✅ SageMaker responded:", response.data);

          // ✅ BƯỚC 5: Lấy product details từ DB
          const predictedProducts = response.data.recommended_products || [];

          if (predictedProducts.length === 0) {
            return res.json({
              success: true,
              recommendations: [],
              method: "sagemaker-ml",
              message: "No recommendations available",
            });
          }

          const productIds = predictedProducts.map((p) => p.product_id);
          const placeholders = productIds.map(() => "?").join(",");

          const productQuery = `
            SELECT 
              product_id,
              name,
              category_id,
              price,
              image_url,
              description
            FROM products
            WHERE product_id IN (${placeholders})
            AND is_active = 1
          `;

          db.query(productQuery, productIds, (err3, productResults) => {
            if (err3) {
              console.error("❌ DB error:", err3);
              return res.status(500).json({
                success: false,
                message: "Database error",
              });
            }

            // ✅ BƯỚC 6: Merge ML scores với product details
            const recommendations = productResults.map((product) => {
              const mlData = predictedProducts.find(
                (p) => p.product_id === product.product_id
              );

              return {
                product_id: product.product_id,
                name: product.name,
                category_id: product.category_id,
                price: product.price,
                image_url: product.image_url,
                description: product.description,
                ml_score: mlData ? mlData.score : 0,
                confidence: mlData ? mlData.confidence : 0,
              };
            });

            return res.json({
              success: true,
              recommendations: recommendations,
              method: "sagemaker-ml",
              order_id: order_id,
              context: {
                user_id: order.user_id,
                store_id: order.store_id,
                weather: {
                  temperature: order.temperature,
                  condition: order.weather_condition,
                  humidity: order.humidity,
                },
                hour: hour,
              },
            });
          });
        } catch (sagemakerError) {
          console.error("❌ SageMaker API Error:", sagemakerError.message);

          if (
            sagemakerError.code === "ECONNREFUSED" ||
            sagemakerError.code === "ETIMEDOUT"
          ) {
            return res.status(503).json({
              success: false,
              message: "SageMaker API unavailable",
              error: sagemakerError.message,
            });
          }

          return res.status(500).json({
            success: false,
            message: "ML service error",
            error: sagemakerError.message,
          });
        }
      });
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = { getMLRecommendations };
