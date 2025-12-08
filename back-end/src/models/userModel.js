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

    createUser: (email, phone, full_name, hashedPassword, image_url, callback) => {
      const sql = `
        INSERT INTO users (email, phone, full_name, password, image_url, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `;
      // Lưu mật khẩu đã băm
      db.query(sql, [email, phone, full_name, hashedPassword, image_url], callback);
    },

    findUserByEmail: (email, callback) => {
      const sql = "SELECT * FROM users WHERE email = ?";
      db.query(sql, [email], callback);
    },

    findUserByPhone: (phone, callback) => {
      const sql = "SELECT * FROM users WHERE phone = ?";
      db.query(sql, [phone], callback);
    },

    getUserById: (id, callback) => {
      const sql = "SELECT * FROM users WHERE user_id = ?";
      db.query(sql, [id], (err, results) => {
        if (err) return callback(err);
        callback(null, results[0]);
      });
    },

    updateAvatar: (userId, avatarUrl, callback) => {
      const sql = "UPDATE users SET image_url = ? WHERE user_id = ?";
      db.query(sql, [avatarUrl, userId], (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      });
    },


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

    deleteUser: (id, callback) => {
      const sql = "DELETE FROM users WHERE user_id = ?";
      db.query(sql, [id], (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      });
    },

    findUserByFirebaseUid: (uid, callback) => {
      const sql = "SELECT * FROM users WHERE firebase_uid = ?";
      db.query(sql, [uid], callback);
    },

    linkFirebaseUidToEmail: (email, uid, callback) => {
      const sql =
        "UPDATE users SET firebase_uid = ?, updated_at = NOW() WHERE email = ?";
      db.query(sql, [uid, email], callback);
    },

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
    },

    getAllUsers: (callback) => {
        const sql = `
            SELECT 
                user_id, 
                full_name, 
                email, 
                phone, 
                date_of_birth, 
                gender, 
                image_url, 
                created_at, 
                updated_at, 
                firebase_uid 
            FROM users 
            ORDER BY created_at DESC
        `;
        db.query(sql, callback);
    },
};