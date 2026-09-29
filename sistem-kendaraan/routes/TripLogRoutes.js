const express = require('express');
const router = express.Router();
const tripLogController = require('../controllers/TripLogController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// HANYA Supir yang boleh mengirim form laporan perjalanan setelah tiba
router.post('/', verifyToken, verifyRole('driver'), tripLogController.submitTripLog);

// HANYA Admin yang boleh memvalidasi (menyetujui) laporan pengeluaran
router.put('/:id/validate', verifyToken, verifyRole('admin'), tripLogController.validateTripLog);

module.exports = router;