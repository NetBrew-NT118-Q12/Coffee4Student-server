const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const { updateProfile, deleteAccount, uploadAvatar } = require("../controllers/profileController");

router.put("/", updateProfile);
router.delete("/:id", deleteAccount);

// ensure upload directory exists
const uploadDir = path.join(__dirname, "../../upload/users");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage });

// POST /profile/upload-avatar
router.post("/upload-avatar", upload.single("avatar"), uploadAvatar);

module.exports = router;