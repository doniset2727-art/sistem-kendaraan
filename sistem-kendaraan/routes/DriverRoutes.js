const express = require('express');
const router = express.Router();
const driverController = require('../controllers/DriverController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// RUTE GET: Mengambil semua data supir untuk ditampilkan di tabel (Hanya Admin)
router.get('/', verifyToken, verifyRole('admin'), driverController.getAllDrivers);

// RUTE POST: Mendaftarkan akun dan kelengkapan supir baru (Hanya Admin)
router.post('/', verifyToken, verifyRole('admin'), driverController.createDriver);

module.exports = router;