const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Memanggil alat enkripsi
const jwt = require('jsonwebtoken');

// Fungsi untuk mendaftarkan User baru
exports.createUser = async (req, res) => {
    try {
        // Menangkap data yang dikirim dari Thunder Client / Frontend
        const { name, email, phone, password, role, department_id, manager_id } = req.body;

        // 1. Validasi: Cek apakah email sudah pernah dipakai
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ status: 'Gagal', message: 'Email sudah terdaftar!' });
        }

        // 2. Enkripsi Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Simpan data ke database
        const newUser = await User.create({
            name,
            email,
            phone,
            password: hashedPassword, // Yang disimpan adalah password yang sudah diacak
            role,
            department_id,
            manager_id: manager_id || null // Jika tidak punya atasan, biarkan null
        });

        // 4. Berikan respon sukses (kita sembunyikan password di respon agar aman)
        return res.status(201).json({
            status: 'Sukses',
            message: 'User berhasil didaftarkan!',
            data: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                department_id: newUser.department_id
            }
        });
    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }
};

// Fungsi untuk Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Cek apakah email terdaftar
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ status: 'Gagal', message: 'Email tidak ditemukan!' });
        }

        // 2. Cek apakah password cocok (Bandingkan password input dengan password acak di database)
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ status: 'Gagal', message: 'Password salah!' });
        }

        // 3. Buat "Kartu Akses" (Token JWT)
        // Rahasia pembuat token sebaiknya disimpan di file .env, tapi kita pakai string sementara dulu
        const secretKey = process.env.JWT_SECRET || 'kunci_rahasia_perusahaan_123';
        const token = jwt.sign(
            { id: user.id, role: user.role, department_id: user.department_id }, 
            secretKey, 
            { expiresIn: '1d' } // Token berlaku 1 hari
        );

        // 4. Kirim respon sukses beserta token
        return res.status(200).json({
            status: 'Sukses',
            message: 'Login berhasil!',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: token // Ini yang akan disimpan oleh Frontend (HP/Web)
            }
        });

    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }
};