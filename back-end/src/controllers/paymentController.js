const Payment = require("../models/paymentModel");

const createPayment = (req, res) => {
  const { order_id, payment_method_id, amount } = req.body;

  if (!order_id || !payment_method_id) {
    return res.status(400).json({ message: "Missing payment data" });
  }

  const paymentData = {
    order_id,
    payment_method_id,
    amount,
    status: "pending",
  };

  Payment.create(paymentData, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err.message });
    }

    return res.status(200).json({
      message: "Payment created successfully",
      payment_id: result.payment_id,
      status: "pending",
    });
  });
};

module.exports = { createPayment };