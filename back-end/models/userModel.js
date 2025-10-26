const db = require("../config/db");

// Tạo user mới
exports.createUser = (email, phone, full_name, password, callback) => {
  const sql = "INSERT INTO users (email, phone, full_name, password) VALUES (?, ?, ?, ?)";
  db.query(sql, [email, phone, full_name, password], callback);
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