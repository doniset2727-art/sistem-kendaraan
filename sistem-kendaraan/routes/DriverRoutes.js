const express = require('express');
const router = express.Router();
const driverController = require('../controllers/DriverController');

// Jalur untuk mendaftarkan profil supir
router.post('/', driverController.createDriver);

module.exports = router;