const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.get('/:user_id', notificationController.getNotifications);
router.put('/read/:id', notificationController.markAsRead);
router.put('/read-all/:userId', notificationController.markAllAsRead);

module.exports = router;