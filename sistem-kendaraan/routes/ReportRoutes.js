const express = require('express');
const router = express.Router();
const reportController = require('../controllers/ReportController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// HANYA Admin dan Manager yang berhak melihat rekapitulasi biaya perusahaan
router.get('/costs', verifyToken, verifyRole('admin', 'manager'), reportController.getCostRecap);

module.exports = router;