const express = require("express");
const router = express.Router();
const { updateProfile, deleteAccount } = require("../controllers/profileController");

router.put("/", updateProfile);
router.delete("/:id", deleteAccount);

module.exports = router;