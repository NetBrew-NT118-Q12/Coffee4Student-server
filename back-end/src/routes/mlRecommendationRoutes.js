// src/routes/mlRecommendationRoutes.js
const express = require("express");
const router = express.Router();
const {
  getMLRecommendations,
  getHybridRecommendations,
} = require("../controllers/mlRecommendationController");

router.post("/", getMLRecommendations);
router.post("/hybrid", getHybridRecommendations); // ← THÊM

module.exports = router;
