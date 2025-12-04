const axios = require("axios");

const SAGEMAKER_API_URL = process.env.SAGEMAKER_API_URL;
const AI_API_URL = process.env.AI_API_URL || "http://127.0.0.1:5001";

/**
 * 🤖 Gợi ý ML Hybrid:
 * - 1 sản phẩm từ SageMaker (ML top pick)
 * - 5 sản phẩm từ Python Hybrid AI
 * - Merge thành 6 sản phẩm, ML ở đầu
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

      // ✅ BƯỚC 2: Lấy context product từ order
      const itemsQuery = `
        SELECT product_id
        FROM orderitems
        WHERE order_id = ?
        LIMIT 1
      `;

      db.query(itemsQuery, [order_id], async (err2, itemResults) => {
        if (err2 || itemResults.length === 0) {
          return res.status(404).json({
            success: false,
            message: "No items in order",
          });
        }

        const contextProductId = itemResults[0].product_id;

        try {
          // ✅ BƯỚC 3A: Gọi SageMaker (1 sản phẩm ML)
          console.log("📞 Calling SageMaker...");

          const sagemakerResponse = await axios.post(
            SAGEMAKER_API_URL,
            {
              user_id: parseInt(order.user_id),
              store_id: parseInt(order.store_id),
              weather_temp: parseFloat(order.temperature) || 28,
              weather_condition: order.weather_condition || "Sunny",
              hour: parseInt(hour),
            },
            { timeout: 10000 }
          );

          const mlProduct = sagemakerResponse.data.predicted_product_id;
          const mlScore = sagemakerResponse.data.ml_score || 0.95;
          const mlConfidence = sagemakerResponse.data.confidence || 0.92;

          console.log(`✅ SageMaker predicted: Product ${mlProduct}`);

          // ✅ BƯỚC 3B: Gọi Python Hybrid AI (5 sản phẩm)
          console.log("📞 Calling Python Hybrid AI...");

          const aiResponse = await axios.post(
            `${AI_API_URL}/api/recommendations`,
            {
              user_id: parseInt(order.user_id),
              product_id: contextProductId,
              top_n: 5, // ← Chỉ lấy 5
            },
            { timeout: 10000 }
          );

          const hybridProducts = aiResponse.data.recommendations || [];

          console.log(
            `✅ Hybrid AI returned ${hybridProducts.length} products`
          );

          // ✅ BƯỚC 4: Lấy product details từ DB
          const allProductIds = [
            mlProduct,
            ...hybridProducts.map((p) => p.product_id),
          ];

          // Loại bỏ duplicate
          const uniqueProductIds = [...new Set(allProductIds)];

          const placeholders = uniqueProductIds.map(() => "?").join(",");

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

          db.query(productQuery, uniqueProductIds, (err3, productResults) => {
            if (err3) {
              console.error("❌ DB error:", err3);
              return res.status(500).json({
                success: false,
                message: "Database error",
              });
            }

            // ✅ BƯỚC 5: Build recommendations list
            const recommendations = [];

            // 5A: Thêm ML product ở đầu
            const mlProductDetail = productResults.find(
              (p) => p.product_id === mlProduct
            );

            if (mlProductDetail) {
              recommendations.push({
                product_id: mlProductDetail.product_id,
                name: mlProductDetail.name,
                category_id: mlProductDetail.category_id,
                price: mlProductDetail.price,
                image_url: mlProductDetail.image_url,
                description: mlProductDetail.description,
                ml_score: mlScore,
                confidence: mlConfidence,
                method: "sagemaker-ml", // ← Đánh dấu
                reason: "AI dự đoán phù hợp nhất",
              });
            }

            // 5B: Thêm hybrid products (loại bỏ nếu trùng với ML)
            for (let hybridItem of hybridProducts) {
              if (hybridItem.product_id === mlProduct) {
                continue; // Skip nếu trùng
              }

              const detail = productResults.find(
                (p) => p.product_id === hybridItem.product_id
              );

              if (detail) {
                recommendations.push({
                  product_id: detail.product_id,
                  name: detail.name,
                  category_id: detail.category_id,
                  price: detail.price,
                  image_url: detail.image_url,
                  description: detail.description,
                  final_score: hybridItem.final_score,
                  content_score: hybridItem.content_score,
                  collab_score: hybridItem.collab_score,
                  method: "hybrid-ai", // ← Đánh dấu
                  reason: "Kết hợp sở thích & người khác cũng thích",
                });
              }
            }

            // ✅ BƯỚC 6: Giới hạn top_n
            const finalRecommendations = recommendations.slice(0, top_n || 6);

            return res.json({
              success: true,
              recommendations: finalRecommendations,
              method: "ml-hybrid",
              order_id: order_id,
              ml_product_id: mlProduct,
              context: {
                user_id: order.user_id,
                store_id: order.store_id,
                weather: {
                  temperature: order.temperature,
                  condition: order.weather_condition,
                },
                hour: hour,
              },
            });
          });
        } catch (apiError) {
          console.error("❌ API Error:", apiError.message);

          // Fallback về hybrid only nếu SageMaker fail
          if (
            apiError.response?.status === 503 ||
            apiError.code === "ECONNREFUSED"
          ) {
            console.log("⚠️ SageMaker unavailable, using hybrid only");

            try {
              const aiResponse = await axios.post(
                `${AI_API_URL}/api/recommendations`,
                {
                  user_id: parseInt(order.user_id),
                  product_id: contextProductId,
                  top_n: top_n || 6,
                },
                { timeout: 10000 }
              );

              return res.json({
                success: true,
                recommendations: aiResponse.data.recommendations || [],
                method: "hybrid-fallback",
                message: "ML service unavailable, using hybrid only",
              });
            } catch (fallbackError) {
              return res.status(500).json({
                success: false,
                message: "Both ML and Hybrid services failed",
                error: fallbackError.message,
              });
            }
          }

          return res.status(500).json({
            success: false,
            message: "ML service error",
            error: apiError.message,
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
