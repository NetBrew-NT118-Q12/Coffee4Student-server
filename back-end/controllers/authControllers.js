const User = require("../models/userModel");

// 📩 Xử lý đăng ký
exports.signup = (req, res) => {
  console.log("📩 Nhận dữ liệu từ Android:", req.body);
  const { email, phone, full_name, password } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!email || !phone || !full_name || !password) {
    return res.status(400).json({ success: false, message: "Thiếu dữ liệu" });
  }

  // Thêm user vào DB
  User.createUser(email, phone, full_name, password, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Lỗi database" });
    }

    const insertedId = result.insertId;
    console.log("✅ Thêm user thành công:", insertedId);

    // Truy vấn lại user vừa được tạo
    User.findUserById(insertedId, (err2, userResult) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ success: false, message: "Lỗi lấy dữ liệu user" });
      }

      if (userResult.length === 0) {
        return res.status(404).json({ success: false, message: "Không tìm thấy user sau khi tạo" });
      }

      const user = userResult[0];

      // ✅ Trả về thông tin user cho app
      res.status(200).json({
        success: true,
        message: "Đăng ký thành công",
        user: {
          id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          token: "" // bạn có thể thêm JWT nếu muốn
        }
      });
    });
  });
};

// 🔑 Xử lý đăng nhập
exports.login = (req, res) => {
  const { email, phone, password } = req.body;

  if ((!email && !phone) || !password) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin đăng nhập (email/số điện thoại hoặc mật khẩu)",
    });
  }

  // Hàm callback xử lý sau khi tìm thấy user
  const handleUserResult = (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return res.status(500).json({ success: false, message: "Lỗi server" });
    }

    if (results.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    const user = results[0];

    if (user.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Sai mật khẩu" });
    }

    // ✅ Đăng nhập thành công
    res.status(200).json({ success: true, message: "Đăng nhập thành công"});
  };

  // 🔹 Xác định đăng nhập bằng email hay phone
  if (email) {
    User.findUserByEmail(email, handleUserResult);
  } else if (phone) {
    User.findUserByPhone(phone, handleUserResult);
  }
};