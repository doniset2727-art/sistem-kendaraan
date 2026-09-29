const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/VehicleController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// HANYA Admin yang boleh menambahkan mobil ke garasi
router.post('/', verifyToken, verifyRole('admin'), vehicleController.createVehicle);

module.exports = router;