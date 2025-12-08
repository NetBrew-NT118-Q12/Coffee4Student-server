const NotificationModel = require('../models/notificationModel');

exports.getNotifications = (req, res) => {
    const userId = req.params.user_id; 

    if (!userId) {
        return res.status(400).json({ message: "Missing user_id" });
    }

    NotificationModel.getNotificationsByUserId(userId, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
        
        res.status(200).json(results);
    });
};

exports.markAsRead = (req, res) => {
    const notiId = req.params.id;

    NotificationModel.updateReadStatus(notiId, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error updating status", error: err.message });
        }
        res.status(200).json({ message: "Marked as read", affectedRows: result.affectedRows });
    });
};

exports.markAllAsRead = (req, res) => {
    const userId = req.params.userId;

    NotificationModel.updateAllReadStatus(userId, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error updating all", error: err.message });
        }
        res.status(200).json({ message: "All marked as read", affectedRows: result.affectedRows });
    });
};