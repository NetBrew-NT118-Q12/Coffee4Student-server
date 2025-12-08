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
        o.delivery_type,
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

      // ✅ BƯỚC 2: Lấy SẢN PHẨM ĐẦU TIÊN trong order (làm context)
      const itemsQuery = `
        SELECT 
          oi.product_id,
          p.category_id,
          pa.has_caffeine,
          pa.has_milk,
          pa.drink_type,
          pa.temperature
        FROM orderitems oi
        JOIN products p ON oi.product_id = p.product_id
        LEFT JOIN product_attributes pa ON p.product_id = pa.product_id
        WHERE oi.order_id = ?
        LIMIT 1
      `;

      db.query(itemsQuery, [order_id], async (err2, itemResults) => {
        if (err2 || itemResults.length === 0) {
          return res.status(404).json({
            success: false,
            message: "No items in order",
          });
        }

        const contextProduct = itemResults[0];

        // ✅ BƯỚC 3: Chuẩn bị payload CHO SAGEMAKER
        const sagemakerPayload = {
          user_id: parseInt(order.user_id),
          store_id: parseInt(order.store_id),
          weather_temp: parseFloat(order.temperature) || 28,
          weather_condition: order.weather_condition || "Sunny",
          hour: parseInt(hour),

          // ✅ THÊM: Product context
          product_id: contextProduct.product_id,
          category_id: contextProduct.category_id || 3,
          has_caffeine: contextProduct.has_caffeine || 1,
          has_milk: contextProduct.has_milk || 1,
          delivery_type: order.delivery_type || "delivery",
          drink_type: contextProduct.drink_type || "coffee",
          temperature: contextProduct.temperature || "cold",
        };

        console.log(
          "📤 SageMaker payload:",
          JSON.stringify(sagemakerPayload, null, 2)
        );

        try {
          // ✅ BƯỚC 4A: Gọi SageMaker với PRODUCT CONTEXT
          console.log("📞 Calling SageMaker...");

          const sagemakerResponse = await axios.post(
            SAGEMAKER_API_URL,
            sagemakerPayload,
            {
              timeout: 10000,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          // ✅ Parse body nếu API Gateway trả về string
          let sagemakerData = sagemakerResponse.data;

          console.log(
            "📦 Raw SageMaker response:",
            JSON.stringify(sagemakerData, null, 2)
          );

          // Nếu có statusCode và body string → parse body
          if (
            sagemakerData.statusCode &&
            typeof sagemakerData.body === "string"
          ) {
            console.log("🔄 Parsing API Gateway body...");
            sagemakerData = JSON.parse(sagemakerData.body);
          }

          console.log(
            "📦 Parsed SageMaker data:",
            JSON.stringify(sagemakerData, null, 2)
          );

          // Kiểm tra success
          if (!sagemakerData.success) {
            throw new Error("SageMaker returned success: false");
          }

          const mlProduct = sagemakerData.predicted_product_id;
          const mlScore = sagemakerData.ml_score || 0.95;
          const mlConfidence = sagemakerData.confidence || 0.92;

          console.log(`✅ SageMaker predicted: Product ${mlProduct}`);

          if (!mlProduct) {
            throw new Error("SageMaker did not return a product_id");
          }

          // ✅ BƯỚC 4B: Gọi Python Hybrid AI (5 sản phẩm)
          console.log("📞 Calling Python Hybrid AI...");

          const aiResponse = await axios.post(
            `${AI_API_URL}/api/recommendations`,
            {
              user_id: parseInt(order.user_id),
              product_id: contextProduct.product_id,
              top_n: 5,
            },
            { timeout: 10000 }
          );

          const hybridProducts = aiResponse.data.recommendations || [];

          console.log(
            `✅ Hybrid AI returned ${hybridProducts.length} products`
          );

          // ✅ BƯỚC 5: Lấy product details từ DB
          const allProductIds = [
            mlProduct,
            ...hybridProducts.map((p) => p.product_id),
          ];

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

            // ✅ BƯỚC 6: Build recommendations list
            const recommendations = [];

            // 6A: Thêm ML product ở đầu
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
                method: "sagemaker-ml",
                reason: "AI dự đoán phù hợp nhất",
              });

              console.log(`✅ Added ML product: ${mlProductDetail.name}`);
            } else {
              console.warn(`⚠️ ML product ${mlProduct} not found in DB`);
            }

            // 6B: Thêm hybrid products (loại bỏ nếu trùng với ML)
            for (let hybridItem of hybridProducts) {
              if (hybridItem.product_id === mlProduct) {
                console.log(
                  `⏭️ Skipping duplicate product ${hybridItem.product_id}`
                );
                continue;
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
                  method: "hybrid-ai",
                  reason: "Kết hợp sở thích & người khác cũng thích",
                });
              }
            }

            console.log(`📊 Total recommendations: ${recommendations.length}`);

            // ✅ BƯỚC 7: Giới hạn top_n
            const finalRecommendations = recommendations.slice(0, top_n || 6);

            return res.json({
              success: true,
              recommendations: finalRecommendations,
              method: "ml-hybrid",
              order_id: order_id,
              ml_product_id: mlProduct,
              hybrid_count: hybridProducts.length,
              context: {
                user_id: order.user_id,
                store_id: order.store_id,
                context_product_id: contextProduct.product_id,
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

          if (apiError.response) {
            console.error("❌ Response status:", apiError.response.status);
            console.error(
              "❌ Response data:",
              JSON.stringify(apiError.response.data, null, 2)
            );
          }

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
                  product_id: contextProduct.product_id,
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
