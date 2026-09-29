const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/VehicleController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// RUTE GET: Untuk mengambil daftar semua mobil (Bisa diakses oleh semua yang sudah login)
router.get('/', verifyToken, vehicleController.getAllVehicles);

// RUTE POST: HANYA Admin yang boleh menambahkan mobil ke garasi
router.post('/', verifyToken, verifyRole('admin'), vehicleController.createVehicle);

module.exports = router;