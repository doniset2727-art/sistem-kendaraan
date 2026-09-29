const TripLog = require('../models/TripLog');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Assignment = require('../models/Assignment');

// Fungsi untuk Supir mengirim laporan setelah perjalanan selesai
exports.submitTripLog = async (req, res) => {
    try {
        const { booking_id, driver_id, start_odometer, end_odometer, fuel_cost, toll_cost, parking_cost } = req.body;

        // 1. Cek Pesanan
        const booking = await Booking.findByPk(booking_id);
        if (!booking) {
            return res.status(404).json({ status: 'Gagal', message: 'Pesanan tidak ditemukan!' });
        }

        // 2. Simpan Laporan ke tabel trip_logs
        const newLog = await TripLog.create({
            booking_id,
            driver_id,
            start_odometer,
            end_odometer,
            fuel_cost: fuel_cost || 0,
            toll_cost: toll_cost || 0,
            parking_cost: parking_cost || 0,
            validation_status: 'pending' // Menunggu divalidasi oleh Admin Kendaraan
        });

        // 3. Otomatis selesaikan tiket dan bebaskan Mobil & Supir
        booking.status = 'completed';
        await booking.save();

        const assignment = await Assignment.findOne({ where: { booking_id } });
        if (assignment) {
            // Bebaskan Mobil dan Update Kilometernya
            const vehicle = await Vehicle.findByPk(assignment.vehicle_id);
            if (vehicle) {
                vehicle.status = 'available';
                vehicle.current_odometer = end_odometer; // Kilometer mobil bertambah!
                await vehicle.save();
            }

            // Bebaskan Supir
            const driver = await Driver.findByPk(assignment.driver_id);
            if (driver) {
                driver.status = 'available';
                await driver.save();
            }
        }

        return res.status(201).json({
            status: 'Sukses',
            message: 'Laporan perjalanan berhasil dikirim! Mobil dan Supir kembali tersedia di garasi.',
            data: newLog
        });

    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }
};

// Fungsi untuk Admin Kendaraan memvalidasi laporan perjalanan & klaim biaya
exports.validateTripLog = async (req, res) => {
    try {
        const { id } = req.params; // ID dari trip_log
        const { validated_by, validation_status, validation_note } = req.body;

        // 1. Cari data trip log berdasarkan ID
        const tripLog = await TripLog.findByPk(id);
        if (!tripLog) {
            return res.status(404).json({ status: 'Gagal', message: 'Laporan perjalanan tidak ditemukan!' });
        }

        // 2. Validasi status yang dikirim harus valid
        if (!['validated', 'rejected'].includes(validation_status)) {
            return res.status(400).json({ status: 'Gagal', message: 'Status validasi harus "validated" atau "rejected"!' });
        }

        // 3. Update status validasi
        tripLog.validation_status = validation_status;
        tripLog.validated_by = validated_by;
        tripLog.validation_note = validation_note || null;
        
        await tripLog.save();

        return res.status(200).json({
            status: 'Sukses',
            message: `Laporan perjalanan berhasil di-${validation_status} oleh Admin!`,
            data: tripLog
        });

    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }
};