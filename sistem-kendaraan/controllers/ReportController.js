const TripLog = require('../models/TripLog');
const db = require('../config/database'); // Panggil koneksi DB untuk fungsi SUM

// Fungsi untuk merekap total pengeluaran
exports.getCostRecap = async (req, res) => {
    try {
        // Menggunakan fungsi bawaan SQL (SUM) untuk menjumlahkan kolom
        const totalCosts = await TripLog.findAll({
            where: { validation_status: 'validated' }, // Hanya hitung yang sudah disetujui Admin
            attributes: [
                [db.fn('SUM', db.col('fuel_cost')), 'total_fuel'],
                [db.fn('SUM', db.col('toll_cost')), 'total_toll'],
                [db.fn('SUM', db.col('parking_cost')), 'total_parking']
            ]
        });

        return res.status(200).json({
            status: 'Sukses',
            message: 'Berhasil merekap total biaya operasional kendaraan',
            data: totalCosts[0] // Ambil data index ke-0 karena hasil SUM ada di sana
        });

    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }
};