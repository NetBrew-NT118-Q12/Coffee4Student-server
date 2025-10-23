const db = require("../config/db");

// Tạo user mới
exports.createUser = (email, phone, full_name, dob, password, callback) => {
  const sql = "INSERT INTO users (email, phone, full_name, date_of_birth, password) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [email, phone, full_name, dob, password], callback);
};

// Tìm user theo email
exports.findUserByEmail = (email, callback) => {
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], callback);
};