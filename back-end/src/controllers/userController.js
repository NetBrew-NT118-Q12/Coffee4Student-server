const UserModel = require("../models/userModel");

// Hàm lấy danh sách tất cả user
const getAllUsers = (req, res) => {
    UserModel.getAllUsers((err, users) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Lỗi khi lấy danh sách người dùng",
                error: err.message
            });
        }

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    });
};

module.exports = { getAllUsers };