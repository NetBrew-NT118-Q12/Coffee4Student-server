const OrderItem = require("../models/orderItemModel");

const getItemsByUserId = (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  OrderItem.getByUserId(userId, (err, items) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch order items",
        error: err.message
      });
    }

    res.json(items);
  });
};

module.exports = { getItemsByUserId };