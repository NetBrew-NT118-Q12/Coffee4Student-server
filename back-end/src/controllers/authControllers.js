const User = require("../models/userModel");
const bcrypt = require("bcrypt"); // Thư viện băm mật khẩu
const admin = require("firebase-admin"); // Thư viện Firebase Admin

const saltRounds = 10; // Số vòng băm

// HELPER: Hàm định dạng chung cho user trả về
const formatUserResponse = (user) => {
  return {
    id: user.user_id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    dob: user.date_of_birth,
    gender: user.gender,
    image_url: user.image_url,
    token: "", // Vẫn để trống vì bạn chưa dùng JWT
  };
};

// 🧩 Xử lý đăng ký (ĐÃ NÂNG CẤP BCRYPT)
exports.signup = (req, res) => {
  console.log("📩 Nhận dữ liệu từ Android:", req.body);
  const { email, phone, full_name, password } = req.body;

  // 🖼️ Ảnh mặc định
  const defaultAvatarUrl = `https://netbrew.s3.ap-southeast-1.amazonaws.com/public/default_avatar.jpg`;

  // 1. Băm mật khẩu
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      console.error("Lỗi băm mật khẩu:", err);
      return res.status(500).json({ success: false, message: "Lỗi server" });
    }

    // 2. Thêm user vào DB với mật khẩu đã băm
    User.createUser(
      email,
      phone,
      full_name,
      hashedPassword, // 👈 Dùng mật khẩu đã băm
      defaultAvatarUrl,
      (err, result) => {
        if (err) {
          console.error(err);
          // Xử lý lỗi
          if (err.code === "ER_DUP_ENTRY") {
            return res
              .status(409)
              .json({ success: false, message: "Email hoặc SĐT đã tồn tại" });
          }
          return res
            .status(500)
            .json({ success: false, message: "Lỗi database" });
        }

        console.log("✅ Thêm user thành công:", result.insertId);
        res.status(200).json({ success: true, message: "Đăng ký thành công" });
      }
    );
  });
};

// 🔑 Xử lý đăng nhập (ĐÃ NÂNG CẤP BCRYPT)
exports.login = (req, res) => {
  const { email, phone, password } = req.body;

  if ((!email && !phone) || !password) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin đăng nhập (email/số điện thoại hoặc mật khẩu)",
    });
  }

  // Hàm callback xử lý sau khi tìm thấy user
  const handleUserResult = (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return res.status(500).json({ success: false, message: "Lỗi server" });
    }

    if (results.length === 0) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Email hoặc Số điện thoại không tồn tại",
        });
    }

    const user = results[0];

    // Nếu user đăng ký bằng social, họ sẽ không có mật khẩu
    if (!user.password) {
      return res
        .status(401)
        .json({
          success: false,
          message:
            "Tài khoản này được đăng ký qua Google/Facebook. Vui lòng đăng nhập bằng Google/Facebook.",
        });
    }

    // 1. So sánh mật khẩu an toàn bằng bcrypt
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Lỗi server khi so sánh pass" });
      }

      // 2. Nếu mật khẩu KHÔNG khớp
      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, message: "Sai mật khẩu" });
      }

      // 3. ✅ Mật khẩu khớp! Trả về thông tin user
      res.status(200).json({
        success: true,
        message: "Đăng nhập thành công", // Sửa lỗi "Đăng ký"
        user: formatUserResponse(user), // Dùng hàm helper
      });
    });
  };

  // 🔹 Xác định đăng nhập bằng email hay phone
  if (email) {
    User.findUserByEmail(email, handleUserResult);
  } else if (phone) {
    User.findUserByPhone(phone, handleUserResult);
  }
};

// 🚀 Xử lý đăng nhập xã hội (GOOGLE/FACEBOOK) (HÀM MỚI)
exports.socialLogin = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(401).json({ success: false, message: "Thiếu ID Token" });
  }

  try {
    // 1. Xác thực token với Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const uid = decodedToken.uid;
    const email = decodedToken.email;
    const fullName = decodedToken.name;
    // Lấy ảnh từ Firebase, nếu không có thì dùng ảnh S3
    const imageUrl =
      decodedToken.picture ||
      `https://netbrew.s3.ap-southeast-1.amazonaws.com/public/default_avatar.jpg`;

    // 2. Tìm user trong DB của BẠN bằng Firebase UID
    User.findUserByFirebaseUid(uid, (err, results) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ success: false, message: "Lỗi database (find by uid)" });
      }

      // TRƯỜNG HỢP 1: User đã đăng nhập bằng social này rồi
      if (results.length > 0) {
        const user = results[0];
        // Trả về thông tin user
        return res.status(200).json({
          success: true,
          message: "Đăng nhập thành công",
          user: formatUserResponse(user),
        });
      }

      // TRƯỜNG HỢP 2: User CHƯA đăng nhập bằng social này
      // Kiểm tra xem email này đã tồn tại trong DB chưa (do đăng ký bằng password)
      User.findUserByEmail(email, (err, emailResults) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .json({ success: false, message: "Lỗi database (find by email)" });
        }

        // 2a: Email này ĐÃ CÓ (User đăng ký bằng pass, giờ login bằng social)
        if (emailResults.length > 0) {
          const existingUser = emailResults[0];
          // Gắn (link) firebase_uid vào user này
          User.linkFirebaseUidToEmail(email, uid, (err, linkResult) => {
            if (err) {
              console.error(err);
              return res
                .status(500)
                .json({
                  success: false,
                  message: "Lỗi database (linking uid)",
                });
            }

            // Trả về user đã được link
            return res.status(200).json({
              success: true,
              message: "Đăng nhập và liên kết tài khoản thành công",
              user: formatUserResponse(existingUser),
            });
          });
        }
        // 2b: User này MỚI HOÀN TOÀN (chưa có email, chưa có uid)
        else {
          User.createSocialUser(
            uid,
            email,
            fullName,
            imageUrl,
            (err, createResult) => {
              if (err) {
                console.error(err);
                return res
                  .status(500)
                  .json({
                    success: false,
                    message: "Lỗi database (create social)",
                  });
              }
              // Lấy lại user vừa tạo để trả về
              User.getUserById(createResult.insertId, (err, newUser) => {
                if (err || !newUser) {
                  return res
                    .status(500)
                    .json({ success: false, message: "Lỗi lấy user vừa tạo" });
                }
                return res.status(200).json({
                  success: true,
                  message: "Đăng ký xã hội thành công",
                  user: formatUserResponse(newUser),
                });
              });
            }
          );
        }
      });
    });
  } catch (error) {
    // Token không hợp lệ
    console.error("Lỗi xác thực Firebase Token:", error);
    return res
      .status(403)
      .json({ success: false, message: "Token không hợp lệ hoặc hết hạn" });
  }
};
