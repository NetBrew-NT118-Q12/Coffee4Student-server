const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/authControllers");

router.post("/signup", authControllers.signup);
router.post("/login", authControllers.login);

// ROUTE MỚI ĐỂ XỬ LÝ GOOGLE/FACEBOOK
router.post("/social-login", authControllers.socialLogin);

module.exports = router;
