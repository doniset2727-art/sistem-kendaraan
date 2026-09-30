const TripLog = require('../models/TripLog');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Assignment = require('../models/Assignment');
const User = require('../models/User'); // Tambahan untuk relasi

exports.submitTripLog = async (req, res) => {
    try {
        // 👇 other_cost kita tangkap dari Frontend
        const { booking_id, driver_id, start_odometer, end_odometer, fuel_cost, toll_cost, parking_cost, other_cost } = req.body;

        const booking = await Booking.findByPk(booking_id);
        if (!booking) return res.status(404).json({ status: 'Gagal', message: 'Pesanan tidak ditemukan!' });

        const newLog = await TripLog.create({
            booking_id,
            driver_id,
            start_odometer,
            end_odometer,
            fuel_cost: fuel_cost || 0,
            toll_cost: toll_cost || 0,
            parking_cost: parking_cost || 0,
            other_cost: other_cost || 0, // 👇 Masukkan other_cost ke database
            validation_status: 'pending' 
        });

        booking.status = 'completed';
        await booking.save();

        const assignment = await Assignment.findOne({ where: { booking_id } });
        if (assignment) {
            const vehicle = await Vehicle.findByPk(assignment.vehicle_id);
            if (vehicle) {
                vehicle.status = 'available';
                vehicle.current_odometer = end_odometer; 
                await vehicle.save();
            }
            const driver = await Driver.findByPk(assignment.driver_id);
            if (driver) {
                driver.status = 'available';
                await driver.save();
            }
        }

        return res.status(201).json({ status: 'Sukses', message: 'Laporan terkirim!', data: newLog });
    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }
};

exports.validateTripLog = async (req, res) => {
    try {
        const { id } = req.params; 
        const { validated_by, validation_status, validation_note } = req.body;

        const tripLog = await TripLog.findByPk(id);
        if (!tripLog) return res.status(404).json({ status: 'Gagal', message: 'Laporan tidak ditemukan!' });

        if (!['validated', 'rejected'].includes(validation_status)) {
            return res.status(400).json({ status: 'Gagal', message: 'Status tidak valid!' });
        }

        tripLog.validation_status = validation_status;
        tripLog.validated_by = validated_by;
        tripLog.validation_note = validation_note || null;
        
        await tripLog.save();
        return res.status(200).json({ status: 'Sukses', data: tripLog });
    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }
};

// 👇 FUNGSI BARU YANG WAJIB ADA AGAR TABEL LAPORAN DI REACT MUNCUL 👇
exports.getAllTripLogs = async (req, res) => {
    try {
        const logs = await TripLog.findAll({
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: Driver,
                    include: [{ model: User, attributes: ['name', 'nip'] }] // Tarik NIP & Nama Supir
                },
                {
                    model: Booking,
                    include: [
                        { 
                            model: Assignment, 
                            include: [{ model: Vehicle, attributes: ['license_plate'] }] // Tarik Plat Mobil
                        }
                    ]
                }
            ]
        });
        return res.status(200).json({ status: 'Sukses', data: logs });
    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }
};