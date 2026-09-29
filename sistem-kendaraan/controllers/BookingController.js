const Booking = require('../models/Booking');
const User = require('../models/User');

// Fungsi untuk membuat pesanan kendaraan baru
exports.createBooking = async (req, res) => {
    try {
        // 1. Menangkap semua data form dari request
        const { 
            user_id, destination_type, destination_address, purpose, 
            is_carrying_goods, goods_description, return_status, 
            start_time, end_time 
        } = req.body;

        // 2. Cari data si Pemesan di database untuk mengecek siapa atasannya
        const pemesan = await User.findByPk(user_id);
        if (!pemesan) {
            return res.status(404).json({ status: 'Gagal', message: 'User pemesan tidak ditemukan!' });
        }

        // 3. Buat Kode Booking Unik (Contoh: BK-1712345678)
        const booking_code = `BK-${Date.now()}`;

        // 4. Simpan pesanan ke tabel bookings
        const newBooking = await Booking.create({
            booking_code,
            user_id,
            approver_id: pemesan.manager_id, // OTOMATIS mendeteksi atasan pemesan!
            destination_type,
            destination_address,
            purpose,
            is_carrying_goods,
            goods_description,
            return_status,
            start_time,
            end_time,
            // Jika dia punya atasan, statusnya 'pending_approval'. 
            // Jika dia level tertinggi (tidak punya atasan), langsung 'pending_assignment' ke Kabag Kendaraan
            status: pemesan.manager_id ? 'pending_approval' : 'pending_assignment'
        });

        // 5. Berikan respon sukses
        return res.status(201).json({
            status: 'Sukses',
            message: 'Pesanan kendaraan dinas berhasil dibuat!',
            data: newBooking
        });

    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }    
};

// Fungsi untuk Manager melakukan Approve atau Reject
exports.approveBooking = async (req, res) => {
    try {
        const { id } = req.params; // Mengambil ID pesanan dari ujung URL
        const { approver_id, action, rejection_reason } = req.body; 

        // 1. Cari tiket pesanan berdasarkan ID
        const booking = await Booking.findByPk(id);
        if (!booking) {
            return res.status(404).json({ status: 'Gagal', message: 'Tiket pesanan tidak ditemukan!' });
        }

        // 2. Keamanan Lapisan 1: Pastikan yang nge-klik "Approve" benar-benar atasannya!
        if (booking.approver_id !== approver_id) {
            return res.status(403).json({ status: 'Gagal', message: 'Akses Ditolak! Anda bukan atasan yang berhak menyetujui tiket ini.' });
        }

        // 3. Proses berdasarkan Action (approve / reject)
        if (action === 'approve') {
            booking.status = 'pending_assignment'; // Lanjut ke antrean Kabag Kendaraan
        } else if (action === 'reject') {
            booking.status = 'rejected';
            booking.rejection_reason = rejection_reason || 'Ditolak oleh atasan tanpa alasan.';
        } else {
            return res.status(400).json({ status: 'Gagal', message: 'Action tidak valid!' });
        }

        // 4. Simpan perubahan (Update) ke database
        await booking.save();

        return res.status(200).json({
            status: 'Sukses',
            message: `Tiket pesanan berhasil di-${action}!`,
            data: booking
        });

    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }
};

// Fungsi untuk melihat riwayat pesanan (Bisa difilter)
exports.getBookingHistory = async (req, res) => {
    try {
        // Menangkap filter dari URL (misal: ?user_id=3 atau ?status=completed)
        const { user_id, status } = req.query; 
        
        let condition = {};
        if (user_id) condition.user_id = user_id;
        if (status) condition.status = status;

        // Ambil data dari database berdasarkan kondisi & urutkan dari yang terbaru
        const bookings = await Booking.findAll({
            where: condition,
            order: [['created_at', 'DESC']] 
        });

        return res.status(200).json({
            status: 'Sukses',
            message: 'Berhasil mengambil riwayat pesanan',
            data: bookings
        });

    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }
};