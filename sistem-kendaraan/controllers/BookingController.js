const Booking = require('../models/Booking');
const User = require('../models/User');
// 👇 Tambahan model untuk keperluan JOIN 👇
const Department = require('../models/Department');
const Assignment = require('../models/Assignment');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');

exports.createBooking = async (req, res) => {
    try {
        const { 
            user_id, destination_type, destination_address, purpose, 
            is_carrying_goods, goods_description, return_status, 
            start_time, end_time 
        } = req.body;

        const pemesan = await User.findByPk(user_id);
        if (!pemesan) {
            return res.status(404).json({ status: 'Gagal', message: 'User pemesan tidak ditemukan!' });
        }

        const booking_code = `BK-${Date.now()}`;

        const newBooking = await Booking.create({
            booking_code,
            user_id,
            approver_id: pemesan.manager_id, 
            destination_type,
            destination_address,
            purpose,
            is_carrying_goods,
            goods_description,
            return_status,
            start_time,
            end_time,
            status: pemesan.manager_id ? 'pending_approval' : 'pending_assignment'
        });

        return res.status(201).json({
            status: 'Sukses',
            message: 'Pesanan kendaraan dinas berhasil dibuat!',
            data: newBooking
        });
    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }    
};

exports.approveBooking = async (req, res) => {
    try {
        const { id } = req.params; 
        const { approver_id, action, rejection_reason } = req.body; 

        const booking = await Booking.findByPk(id);
        if (!booking) {
            return res.status(404).json({ status: 'Gagal', message: 'Tiket pesanan tidak ditemukan!' });
        }

        if (booking.approver_id !== approver_id) {
            return res.status(403).json({ status: 'Gagal', message: 'Akses Ditolak!' });
        }

        if (action === 'approve') {
            booking.status = 'pending_assignment'; 
        } else if (action === 'reject') {
            booking.status = 'rejected';
            booking.rejection_reason = rejection_reason || 'Ditolak oleh atasan tanpa alasan.';
        } else {
            return res.status(400).json({ status: 'Gagal', message: 'Action tidak valid!' });
        }

        await booking.save();

        return res.status(200).json({ status: 'Sukses', message: `Tiket pesanan berhasil di-${action}!`, data: booking });
    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }
};

// 👇 INI YANG KITA UPGRADE (Fitur JOIN yang kompleks) 👇
exports.getBookingHistory = async (req, res) => {
    try {
        const { user_id, status } = req.query; 
        
        let condition = {};
        if (user_id) condition.user_id = user_id;
        if (status) condition.status = status;

        const bookings = await Booking.findAll({
            where: condition,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'Pemesan', // Sesuai relasi di index.js
                    attributes: ['name', 'nip'],
                    include: [{ model: Department, attributes: ['name'] }] // Tarik data Departemen
                },
                {
                    model: Assignment,
                    include: [
                        { model: Vehicle, attributes: ['license_plate'] }, // Tarik Plat Mobil
                        { 
                            model: Driver, 
                            include: [{ model: User, attributes: ['name', 'nip'] }] // Tarik Nama & NIP Supir
                        }
                    ]
                }
            ]
        });

        return res.status(200).json({ status: 'Sukses', data: bookings });
    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }
};

// 1. Ambil antrean tiket bawahan khusus untuk Manager yang sedang login
exports.getManagerApprovals = async (req, res) => {
    try {
        const { manager_id } = req.params;

        const approvals = await Booking.findAll({
            where: { 
                approver_id: manager_id,
                status: 'pending_approval' // Hanya yang butuh tindakan
            },
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'Pemesan',
                    attributes: ['name', 'nip', 'department_id'],
                    include: [{ model: Department, attributes: ['name'] }]
                }
            ]
        });

        return res.status(200).json({ status: 'Sukses', data: approvals });
    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }
};

// 2. Ambil riwayat tiket mandiri milik Staff yang sedang login
exports.getMyBookings = async (req, res) => {
    try {
        const { user_id } = req.params;

        const myBookings = await Booking.findAll({
            where: { user_id },
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: Assignment,
                    include: [
                        { model: Vehicle, attributes: ['brand_model', 'license_plate'] },
                        { 
                            model: Driver, 
                            include: [{ model: User, attributes: ['name', 'nip', 'phone'] }] 
                        }
                    ]
                }
            ]
        });

        return res.status(200).json({ status: 'Sukses', data: myBookings });
    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }
};