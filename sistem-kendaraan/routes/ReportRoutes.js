const express = require('express');
const router = express.Router();
const reportController = require('../controllers/ReportController');

// Jalur untuk melihat rekap biaya
router.get('/costs', reportController.getCostRecap);

module.exports = router;