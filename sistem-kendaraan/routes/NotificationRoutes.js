const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/NotificationController');
const { verifyToken } = require('../middleware/authMiddleware');

// Semua rute notifikasi bisa diakses asalkan user sudah login (verifyToken)
router.post('/', verifyToken, notificationController.createNotification);
router.get('/user/:userId', verifyToken, notificationController.getUserNotifications);
router.put('/:id/read', verifyToken, notificationController.markAsRead);

module.exports = router;