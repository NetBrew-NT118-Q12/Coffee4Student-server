const PopularProduct = require("../models/popularProductModel");

exports.getPopularProducts = (req, res) => {
  // Lấy tham số từ query string (có thể tùy chỉnh từ Android)
  const days = parseInt(req.query.days) || 30; // Mặc định 30 ngày
  const limit = parseInt(req.query.limit) || 10; // Mặc định 10 sản phẩm

  PopularProduct.getTopProducts(days, limit, (err, results) => {
    if (err) {
      console.error("Lỗi khi lấy sản phẩm phổ biến:", err);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy danh sách sản phẩm phổ biến",
        error: err.message,
      });
    }

    // Trả về danh sách (có thể rỗng nếu chưa có đơn hàng)
    res.status(200).json({
      success: true,
      count: results.length,
      days: days,
      products: results,
    });
  });
};
