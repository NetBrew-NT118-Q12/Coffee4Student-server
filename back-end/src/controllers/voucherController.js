const Voucher = require('../models/voucherModel');

exports.getUserVouchers = (req, res) => {
  const userId = req.params.userId; // Lấy userId từ URL

  if (!userId) {
    return res.status(400).send({ message: "User ID is required" });
  }

  Voucher.getByUserId(userId, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving vouchers."
      });
    } else {
      res.send(data);
    }
  });
};