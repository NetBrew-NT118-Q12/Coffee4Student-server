const express = require("express");
const router = express.Router();
const { getMLRecommendations } = require("../controllers/mlRecommendationController");

/**
 * POST /api/ml-recommendations
 * Body: { user_id, store_id, weather_temp, weather_condition, hour }
 */
router.post("/", getMLRecommendations);

module.exports = router;
