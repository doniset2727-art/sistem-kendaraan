const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/BookingController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// Siapapun yang login bisa melihat riwayat pesanan dan membuat pesanan
router.get('/history', verifyToken, bookingController.getBookingHistory);
router.post('/', verifyToken, bookingController.createBooking);

// HANYA Manager yang boleh melakukan Approve/Reject
router.put('/:id/approve', verifyToken, verifyRole('manager'), bookingController.approveBooking);

module.exports = router;