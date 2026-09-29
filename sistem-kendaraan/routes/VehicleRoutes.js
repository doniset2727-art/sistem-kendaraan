const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/VehicleController');

// Jalur untuk mendaftarkan mobil baru
router.post('/', vehicleController.createVehicle);

module.exports = router;