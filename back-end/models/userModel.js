const db = require("../config/db");

// Tạo user mới
exports.createUser = (email, phone, full_name, password, callback) => {
  const sql = "INSERT INTO Users (email, phone, full_name, password) VALUES (?, ?, ?, ?)";
  db.query(sql, [email, phone, full_name, password], callback);
};

// Tìm user theo email
exports.findUserByEmail = (email, callback) => {
  const sql = "SELECT * FROM Users WHERE email = ?";
  db.query(sql, [email], callback);
};

// 🔍 Tìm người dùng theo số điện thoại
exports.findUserByPhone = (phone, callback) => {
  const sql = "SELECT * FROM Users WHERE phone = ?";
  db.query(sql, [phone], callback);
};

// 📌 Tìm user theo ID
exports.getUserById = (id, callback) => {
  const sql = "SELECT * FROM Users WHERE user_id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
};

// 📌 Cập nhật thông tin user
exports.updateUser = (id, data, callback) => {
  const { full_name, email, dob, gender } = data;
  const sql = `
    UPDATE Users
    SET full_name = ?, email = ?, date_of_birth = ?, gender = ?
    WHERE user_id = ?
  `;
  db.query(sql, [full_name, email, dob, gender, id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

// 📌 Xóa tài khoản user
exports.deleteUser = (id, callback) => {
  const sql = "DELETE FROM Users WHERE user_id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};