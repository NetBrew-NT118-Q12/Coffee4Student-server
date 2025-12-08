const express = require("express");
const router = express.Router();
const {
  getMLRecommendations,
} = require("../controllers/mlRecommendationController");

// POST /api/ml-recommendations
// Body: { order_id, top_n }
router.post("/", getMLRecommendations);

module.exports = router;
