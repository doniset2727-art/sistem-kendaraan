const express = require('express');
const router = express.Router();
const driverController = require('../controllers/DriverController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// HANYA Admin yang boleh mendaftarkan profil SIM supir
router.post('/', verifyToken, verifyRole('admin'), driverController.createDriver);

module.exports = router;