const User = require("../models/userModel");

// 📩 Xử lý đăng ký
exports.signup = (req, res) => {
  console.log("📩 Nhận dữ liệu từ Android:", req.body);    
  const { email, phone, full_name, dob, password } = req.body;
  if (!email && !phone) return res.status(400).json({ success: false, message: "Thiếu email hoặc số điện thoại" });

  User.createUser(email, phone, full_name, dob, password, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Lỗi database" });
    }
    console.log("✅ Thêm user thành công:", result.insertId);
    res.status(200).json({ success: true, message: "Đăng ký thành công" });
  });
};

// 🔑 Xử lý đăng nhập
exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: "Thiếu email hoặc mật khẩu" });

  User.findUserByEmail(email, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Lỗi server" });
    }

    if (results.length === 0)
      return res.status(401).json({ success: false, message: "Không tìm thấy người dùng" });

    const user = results[0];
    if (user.password !== password)
      return res.status(401).json({ success: false, message: "Sai mật khẩu" });

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      name: user.full_name
    });
  });
};