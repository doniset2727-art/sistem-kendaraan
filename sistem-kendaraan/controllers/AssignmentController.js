const Assignment = require('../models/Assignment');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');

// Fungsi untuk menugaskan Mobil dan Supir ke sebuah Pesanan
exports.createAssignment = async (req, res) => {
    try {
        const { booking_id, vehicle_id, driver_id, assigned_by } = req.body;

        // 1. Cek Pesanan: Pastikan pesanannya ada dan statusnya butuh penugasan
        const booking = await Booking.findByPk(booking_id);
        if (!booking || booking.status !== 'pending_assignment') {
            return res.status(400).json({ status: 'Gagal', message: 'Pesanan tidak valid atau belum di-approve atasan!' });
        }

        // 2. Cek Ketersediaan Mobil
        const vehicle = await Vehicle.findByPk(vehicle_id);
        if (!vehicle || vehicle.status !== 'available') {
            return res.status(400).json({ status: 'Gagal', message: 'Mobil tidak tersedia atau sedang dipakai!' });
        }

        // 3. Cek Ketersediaan Supir
        const driver = await Driver.findByPk(driver_id);
        if (!driver || driver.status !== 'available') {
            return res.status(400).json({ status: 'Gagal', message: 'Supir tidak tersedia atau sedang bertugas!' });
        }

        // 4. Buat Data Penugasan
        const newAssignment = await Assignment.create({
            booking_id,
            vehicle_id,
            driver_id,
            assigned_by,
            status: 'active'
        });

        // 5. UPDATE STATUS KETIGANYA (Ini kunci agar tidak terjadi double-booking)
        booking.status = 'assigned'; // Tiket Siti berubah status
        vehicle.status = 'in_use';   // Innova Zenix jadi sibuk
        driver.status = 'on_duty';   // Pak Maman jadi sibuk
        
        await booking.save();
        await vehicle.save();
        await driver.save();

        return res.status(201).json({
            status: 'Sukses',
            message: 'Mobil dan Supir berhasil ditugaskan!',
            data: newAssignment
        });

    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }
};