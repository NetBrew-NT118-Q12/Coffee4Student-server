const db = require("../config/db"); // Đảm bảo đường dẫn này đúng

// Tạo user mới (với mật khẩu đã băm)
exports.createUser = (
  email,
  phone,
  full_name,
  hashedPassword, // Tên đã đổi
  image_url,
  callback
) => {
  const sql = `
    INSERT INTO users (email, phone, full_name, password, image_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, NOW(), NOW())
  `;
  // Lưu mật khẩu đã băm
  db.query(sql, [email, phone, full_name, hashedPassword, image_url], callback);
};

// Tìm user theo email
exports.findUserByEmail = (email, callback) => {
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], callback);
};

// 🔍 Tìm người dùng theo số điện thoại
exports.findUserByPhone = (phone, callback) => {
  const sql = "SELECT * FROM users WHERE phone = ?";
  db.query(sql, [phone], callback);
};

// 📌 Tìm user theo ID
exports.getUserById = (id, callback) => {
  const sql = "SELECT * FROM users WHERE user_id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
};

// 📌 Cập nhật avatar cho user
exports.updateAvatar = (userId, avatarUrl, callback) => {
  const sql = "UPDATE users SET image_url = ? WHERE user_id = ?";
  db.query(sql, [avatarUrl, userId], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

// 📌 Cập nhật thông tin user
exports.updateUser = (id, data, callback) => {
  const { full_name, phone, email, dob, gender } = data;
  const sql = `
    UPDATE users
    SET full_name = ?, phone = ?, email = ?, date_of_birth = ?, gender = ?
    WHERE user_id = ?
  `;
  db.query(sql, [full_name, phone, email, dob, gender, id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

// 📌 Xóa tài khoản user
exports.deleteUser = (id, callback) => {
  const sql = "DELETE FROM users WHERE user_id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

// ============================================
// CÁC HÀM MỚI CHO SOCIAL LOGIN
// ============================================

// 🔍 Tìm user theo Firebase UID
exports.findUserByFirebaseUid = (uid, callback) => {
  const sql = "SELECT * FROM users WHERE firebase_uid = ?";
  db.query(sql, [uid], callback);
};

// 🔗 Gắn Firebase UID cho user đã có (qua email)
// (Giả sử bạn đã chạy lệnh ALTER TABLE để thêm cột `firebase_uid`)
exports.linkFirebaseUidToEmail = (email, uid, callback) => {
  const sql =
    "UPDATE users SET firebase_uid = ?, updated_at = NOW() WHERE email = ?";
  db.query(sql, [uid, email], callback);
};

// 👤 Tạo user mới từ Social (không có SĐT, password là NULL)
exports.createSocialUser = (uid, email, full_name, image_url, callback) => {
  const sql = `
    INSERT INTO users (firebase_uid, email, full_name, image_url, password, created_at, updated_at)
    VALUES (?, ?, ?, ?, NULL, NOW(), NOW())
  `;
  db.query(sql, [uid, email, full_name, image_url], callback);
};
