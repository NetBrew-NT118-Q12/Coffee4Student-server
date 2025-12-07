const db = require('../config/db');

module.exports = {
    // 1. Hàm lưu/cập nhật FCM Token
    updateFcmToken: function(userId, token, resultCallback) {
        // Đã điều chỉnh tên cột từ 'id' thành 'user_id' để thống nhất với các hàm khác
        const query = 'UPDATE users SET fcm_token = ? WHERE user_id = ?';
        
        db.query(query, [token, userId], (err, res) => {
            if (err) {
                console.log("Error updating token: ", err);
                // Trả về lỗi qua callback
                resultCallback(err, null);
                return;
            }
            
            resultCallback(null, res);
        });
    },

    // 2. Hàm lấy Token theo User ID
    getFcmTokenByUserId: function(userId, resultCallback) {
        const query = 'SELECT fcm_token FROM users WHERE user_id = ?';

        db.query(query, [userId], (err, res) => {
            if (err) {
                console.log("Error fetching token: ", err);
                resultCallback(err, null);
                return;
            }

            if (res.length) {
                // Trả về token (field fcm_token của dòng đầu tiên)
                resultCallback(null, res[0].fcm_token);
            } else {
                // Không tìm thấy user hoặc user không có token
                resultCallback(null, null);
            }
        });
    },

    // 3. Tạo user mới (với mật khẩu đã băm)
    createUser: (email, phone, full_name, hashedPassword, image_url, callback) => {
      const sql = `
        INSERT INTO users (email, phone, full_name, password, image_url, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `;
      // Lưu mật khẩu đã băm
      db.query(sql, [email, phone, full_name, hashedPassword, image_url], callback);
    },

    // 4. Tìm user theo email
    findUserByEmail: (email, callback) => {
      const sql = "SELECT * FROM users WHERE email = ?";
      db.query(sql, [email], callback);
    },

    // 5. Tìm người dùng theo số điện thoại
    findUserByPhone: (phone, callback) => {
      const sql = "SELECT * FROM users WHERE phone = ?";
      db.query(sql, [phone], callback);
    },

    // 6. Tìm user theo ID
    getUserById: (id, callback) => {
      const sql = "SELECT * FROM users WHERE user_id = ?";
      db.query(sql, [id], (err, results) => {
        if (err) return callback(err);
        callback(null, results[0]);
      });
    },

    // 7. Cập nhật avatar cho user
    updateAvatar: (userId, avatarUrl, callback) => {
      const sql = "UPDATE users SET image_url = ? WHERE user_id = ?";
      db.query(sql, [avatarUrl, userId], (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      });
    },

    // 8. Cập nhật thông tin user
    updateUser: (id, data, callback) => {
      const { full_name, phone, email, dob, gender } = data;
      const sql = `
        UPDATE users
        SET full_name = ?, phone = ?, email = ?, date_of_birth = ?, gender = ?, updated_at = NOW()
        WHERE user_id = ?
      `;
      db.query(sql, [full_name, phone, email, dob, gender, id], (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      });
    },

    // 9. Xóa tài khoản user
    deleteUser: (id, callback) => {
      const sql = "DELETE FROM users WHERE user_id = ?";
      db.query(sql, [id], (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      });
    },

    // ============================================
    // CÁC HÀM CHO SOCIAL LOGIN
    // ============================================

    // 10. Tìm user theo Firebase UID
    findUserByFirebaseUid: (uid, callback) => {
      const sql = "SELECT * FROM users WHERE firebase_uid = ?";
      db.query(sql, [uid], callback);
    },

    // 11. Gắn Firebase UID cho user đã có (qua email)
    linkFirebaseUidToEmail: (email, uid, callback) => {
      const sql =
        "UPDATE users SET firebase_uid = ?, updated_at = NOW() WHERE email = ?";
      db.query(sql, [uid, email], callback);
    },

    // 12. Tạo user mới từ Social (không có SĐT, password là NULL)
    createSocialUser: (uid, email, full_name, image_url, callback) => {
      const sql = `
        INSERT INTO users (firebase_uid, email, full_name, image_url, password, created_at, updated_at)
        VALUES (?, ?, ?, ?, NULL, NOW(), NOW())
      `;
      db.query(sql, [uid, email, full_name, image_url], callback);
    },

    // Gán voucher cho user mới
    assignVouchersToUser: (userId, callback) => {
        const getVoucherSql = "SELECT voucher_id FROM vouchers WHERE is_active = 1";

        db.query(getVoucherSql, (err, vouchers) => {
            if (err) return callback(err);

            if (vouchers.length === 0) return callback(null, { message: "No vouchers to assign." });

            const insertSql = `
                INSERT INTO voucher_user_usage (voucher_id, user_id, is_used)
                VALUES ?
            `;

            const values = vouchers.map(v => [v.voucher_id, userId, false]);

            db.query(insertSql, [values], callback);
        });
    }
};