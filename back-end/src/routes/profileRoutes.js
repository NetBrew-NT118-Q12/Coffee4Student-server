const express = require("express");
const upload = require("../middleware/profileMiddleware");
const router = express.Router();
const { updateProfile, deleteAccount, uploadAvatar } = require("../controllers/profileController");

router.put("/", updateProfile);
router.delete("/:id", deleteAccount);
// POST /profile/upload-avatar
router.post("/upload-avatar", upload.single("avatar"), uploadAvatar);

module.exports = router;