const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/NotificationController');

// Jalur untuk mengirim notifikasi baru
router.post('/', notificationController.createNotification);

// Jalur untuk melihat notifikasi milik user tertentu
router.get('/user/:userId', notificationController.getUserNotifications);

// Jalur untuk menandai notifikasi sudah dibaca
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;