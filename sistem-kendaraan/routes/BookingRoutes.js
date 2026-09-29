const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/BookingController');

// Jalur untuk membuat pesanan baru (Staff)
router.post('/', bookingController.createBooking);

// Jalur untuk menyetujui/menolak pesanan (Manager)
// Tanda :id artinya angka id-nya bisa berubah-ubah (dinamis)
router.put('/:id/approve', bookingController.approveBooking);
// Tambahkan baris ini di bawah rute-rute yang sudah ada
router.get('/history', bookingController.getBookingHistory);

module.exports = router;