const User = require("../models/userModel");

// ✅ Cập nhật thông tin người dùng
exports.updateProfile = (req, res) => {
  const { id, full_name, email, dob, gender } = req.body;
  
  User.updateUser(id, { full_name, email, dob, gender }, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Lỗi database" });
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: "Không tìm thấy user" });

        // 🔍 Sau khi update xong, lấy lại user để gửi về cho client
    User.getUserById(id, (err, user) => {
      if (err) {
        console.error("❌ Lỗi lấy user sau cập nhật:", err);
        return res.status(500).json({ success: false, message: "Lỗi khi lấy lại dữ liệu user" });
      }

      if (!user) {
        return res.status(404).json({ success: false, message: "Không tìm thấy user" });
      }

      res.status(200).json({
        success: true,
        message: "Cập nhật thành công",
        user: {
          id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          dob: user.date_of_birth,
          gender: user.gender,
          token: ""
        }
      });
    });
  });
};

// ✅ Xóa tài khoản
exports.deleteAccount = (req, res) => {
  const { id } = req.params;

  User.deleteUser(id, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Lỗi database" });
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: "Không tìm thấy user" });

    res.status(200).json({ success: true, message: "Xóa tài khoản thành công" });
  });
};