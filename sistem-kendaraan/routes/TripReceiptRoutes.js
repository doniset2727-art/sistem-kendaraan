const express = require('express');
const router = express.Router();
const tripReceiptController = require('../controllers/TripReceiptController');

// Jalur untuk melampirkan struk
router.post('/', tripReceiptController.uploadReceipt);

module.exports = router;