const express = require('express');
const router = express.Router();
const tripLogController = require('../controllers/TripLogController');

// Jalur untuk supir mengirim laporan
router.post('/', tripLogController.submitTripLog);

// Jalur untuk admin memvalidasi laporan
router.put('/:id/validate', tripLogController.validateTripLog);

module.exports = router;