const User = require("../models/userModel");
const path = require("path");
const fs = require("fs");

// ✅ Cập nhật thông tin người dùng
exports.updateProfile = (req, res) => {
  const { id, full_name, phone, email, dob, gender } = req.body;
  
  User.updateUser(id, { full_name, phone, email, dob, gender }, (err, result) => {
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
          image_url: user.image_url,
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

// Upload ảnh và lưu vào database
// Multer cấu hình được đặt trong route để dễ hiểu, controller xử lý sau khi file có ở req.file
exports.uploadAvatar = async (req, res) => {
  try {
    const userId = req.body.user_id;
    console.log("User ID:", userId);
    console.log("File:", req.file);

    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing user_id" });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const avatarUrl = `${req.protocol}://${req.get("host")}/upload/users/${req.file.filename}`;

    // ✅ Cập nhật vào DB qua model
    User.updateAvatar(userId, avatarUrl, (err, result) => {
      if (err) {
        console.error("Database update error:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }
    });

    return res.json({
      success: true,
      message: "Upload successful",
      image_url: avatarUrl,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};