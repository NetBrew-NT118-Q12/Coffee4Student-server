const multer = require("multer");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");
const path = require("path");

// ⚙️ Cấu hình AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "ap-southeast-1",
});

// 📦 Tạo S3 instance
const s3 = new AWS.S3();

// 📤 Cấu hình multer để upload trực tiếp lên S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME, // tên bucket
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname) || ".jpg";
      const filename = `upload/users/${Date.now()}${ext}`;
      cb(null, filename);
    },
  }),
});

module.exports = upload;