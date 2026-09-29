const User = require('../models/User');
const Driver = require('../models/Driver');
const bcrypt = require('bcrypt'); // Pastikan library bcrypt / bcryptjs sudah ter-install

exports.createDriver = async (req, res) => {
    try {
        // 1. Tangkap semua data yang dikirim dari React
        const { name, email, password, sim_number, sim_expiry } = req.body;

        // 2. Cek apakah email sudah dipakai (agar tidak bentrok)
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email sudah terdaftar di sistem!' });
        }

        // 3. Enkripsi (Hash) password demi keamanan standar Enterprise
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. LANGKAH AJAIB: Buat akun User terlebih dahulu dengan role otomatis 'driver'
        const newUser = await User.create({
            name: name,
            email: email,
            password: hashedPassword,
            role: 'driver' 
        });

        // 5. Setelah akun jadi, buat data Supir dan kaitkan dengan ID User yang baru dibuat
        const newDriver = await Driver.create({
            user_id: newUser.id, // Ini kunci agar tidak error "Akun user tidak ditemukan"
            sim_number: sim_number,
            sim_expiry: sim_expiry,
            status: 'available'
        });

        return res.status(201).json({
            status: 'Sukses',
            message: 'Akun supir dan kelengkapan SIM berhasil didaftarkan',
            data: newDriver
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan pada server backend', error: error.message });
    }
};

// Pastikan model User sudah di-import di bagian atas file
// const User = require('../models/User'); 

exports.getAllDrivers = async (req, res) => {
    try {
        const drivers = await Driver.findAll({
            include: [{
                model: User,
                attributes: ['name', 'email'] // Hanya ambil nama dan email dari tabel User
            }]
        });
        
        return res.status(200).json({
            status: 'Sukses',
            data: drivers
        });
    } catch (error) {
        return res.status(500).json({ message: 'Gagal mengambil data supir', error: error.message });
    }
};