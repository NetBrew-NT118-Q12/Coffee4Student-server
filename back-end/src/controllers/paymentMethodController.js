const PaymentMethod = require("../models/paymentMethodModel");

const getPaymentMethodByName = (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Missing payment method name" });
  }

  PaymentMethod.getByName(name, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err.message });
    }

    if (!result) {
      return res.status(404).json({ message: "Payment method not found" });
    }

    return res.status(200).json({ payment_method_id: result.payment_method_id });
  });
};

module.exports = { getPaymentMethodByName };