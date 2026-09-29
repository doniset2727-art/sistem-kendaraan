const TripReceipt = require('../models/TripReceipt');
const TripLog = require('../models/TripLog');

// Fungsi untuk menyimpan data lampiran struk
exports.uploadReceipt = async (req, res) => {
    try {
        const { trip_log_id, receipt_type, amount, photo_url } = req.body;

        // 1. Validasi: Pastikan Laporan Perjalanan (Trip Log)-nya memang ada
        const tripLog = await TripLog.findByPk(trip_log_id);
        if (!tripLog) {
            return res.status(404).json({ status: 'Gagal', message: 'Data Trip Log tidak ditemukan!' });
        }

        // 2. Simpan data struk ke database
        const newReceipt = await TripReceipt.create({
            trip_log_id,
            receipt_type,
            amount,
            photo_url
        });

        return res.status(201).json({
            status: 'Sukses',
            message: `Bukti struk ${receipt_type} berhasil dilampirkan!`,
            data: newReceipt
        });

    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }
};