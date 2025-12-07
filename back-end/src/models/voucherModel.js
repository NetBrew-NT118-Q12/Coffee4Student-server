const db = require('../config/db');

const Voucher = function(voucher) {
  this.voucher_id = voucher.voucher_id;
  this.title = voucher.title;
};

// Lấy danh sách voucher thuộc về một user cụ thể
Voucher.getByUserId = (userId, result) => {
  const query = `
    SELECT 
      vu.vc_user_id,
      v.title,
      v.discount_type,
      v.discount_value,
      v.start_date,
      v.end_date,
      v.image_url,
      vu.is_used,
      vu.used_at
    FROM voucher_user_usage vu
    JOIN vouchers v ON vu.voucher_id = v.voucher_id
    WHERE vu.user_id = ?
    AND v.is_active = 1
    AND v.end_date >= NOW()
    ORDER BY vu.is_used ASC, v.end_date ASC; 
  `;
  // Logic sắp xếp: Voucher chưa dùng lên đầu, hạn gần nhất lên đầu

  db.query(query, [userId], (err, res) => {
    if (err) {
      console.log("Error fetching user vouchers: ", err);
      result(err, null);
      return;
    }
    result(null, res);
  });
};

// ---  CẬP NHẬT TRẠNG THÁI ĐÃ DÙNG  ---
Voucher.markAsUsed = (vc_user_id, user_id, result) => {
  const query = `
    UPDATE voucher_user_usage 
    SET is_used = 1, used_at = now() 
    WHERE vc_user_id = ? AND user_id = ?
  `;

  db.query(query, [vc_user_id, user_id], (err, res) => {
    if (err) {
      console.log("Error updating voucher usage: ", err);
      // Nếu có callback result thì trả về lỗi
      if (result) result(err, null);
      return;
    }

    if (res.affectedRows == 0) {
      // Không tìm thấy dòng nào (có thể sai ID)
      if (result) result({ kind: "not_found" }, null);
      return;
    }

    // Trả về kết quả thành công
    if (result) result(null, res);
  });
};

module.exports = Voucher;