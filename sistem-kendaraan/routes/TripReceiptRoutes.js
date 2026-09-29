const express = require('express');
const router = express.Router();
const tripReceiptController = require('../controllers/TripReceiptController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// HANYA Supir yang boleh upload foto struk tol/bensin/parkir
router.post('/', verifyToken, verifyRole('driver'), tripReceiptController.uploadReceipt);

module.exports = router;