const User = require("../models/userModel");

// 🧩 Xử lý đăng ký
exports.signup = (req, res) => {
  console.log("📩 Nhận dữ liệu từ Android:", req.body);
  const { email, phone, full_name, password } = req.body;

  // 🖼️ Ảnh mặc định (URL mà client có thể truy cập)
  const defaultAvatarUrl = `https://netbrew.s3.ap-southeast-1.amazonaws.com/public/default_avatar.jpg`;

  // 🗄️ Thêm user vào DB
  User.createUser(
    email,
    phone,
    full_name,
    password,
    defaultAvatarUrl,
    (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ success: false, message: "Lỗi database" });
      }

      console.log("✅ Thêm user thành công:", result.insertId);
      res.status(200).json({ success: true, message: "Đăng ký thành công" });
    }
  );
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
      return res.status(401).json({ success: false, message: "Sai mật khẩu" });
    }

    // ✅ Trả về thông tin user cho app
    res.status(200).json({
      success: true,
      message: "Đăng ký thành công",
      user: {
        id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        dob: user.date_of_birth,
        gender: user.gender,
        image_url: user.image_url,
        token: "", // bạn có thể thêm JWT nếu muốn
      },
    });
  };

  // 🔹 Xác định đăng nhập bằng email hay phone
  if (email) {
    User.findUserByEmail(email, handleUserResult);
  } else if (phone) {
    User.findUserByPhone(phone, handleUserResult);
  }
};
