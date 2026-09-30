const User = require('../models/User');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');

exports.createUser = async (req, res) => {
    try {
        const { name, nip, email, phone, password, role, department_id, manager_id } = req.body;

        const existingUser = await User.findOne({ where: { nip } });
        if (existingUser) {
            return res.status(400).json({ status: 'Gagal', message: 'NIP sudah terdaftar!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            nip,
            email,
            phone,
            password: hashedPassword,
            role,
            department_id,
            manager_id: manager_id || null 
        });

        return res.status(201).json({
            status: 'Sukses',
            message: 'User berhasil didaftarkan!',
            data: {
                id: newUser.id,
                name: newUser.name,
                nip: newUser.nip,
                role: newUser.role,
                department_id: newUser.department_id
            }
        });
    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { nip, password } = req.body;

        const user = await User.findOne({ where: { nip: nip } });
        if (!user) {
            return res.status(404).json({ status: 'Gagal', message: 'NIP tidak ditemukan!' });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ status: 'Gagal', message: 'Password salah!' });
        }

        const secretKey = process.env.JWT_SECRET || 'kunci_rahasia_perusahaan_123';
        const token = jwt.sign(
            { id: user.id, role: user.role, department_id: user.department_id }, 
            secretKey, 
            { expiresIn: '1d' } 
        );

        return res.status(200).json({
            status: 'Sukses',
            message: 'Login berhasil!',
            data: {
                id: user.id,
                name: user.name,
                nip: user.nip,
                role: user.role,
                token: token 
            }
        });

    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }
};