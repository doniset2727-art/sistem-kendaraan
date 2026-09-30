const User = require('../models/User');
const Driver = require('../models/Driver');
const bcrypt = require('bcrypt');

exports.createDriver = async (req, res) => {
    try {
        const { name, nip, email, password, sim_number, sim_expiry } = req.body;

        const existingUser = await User.findOne({ where: { nip } }); 
        if (existingUser) {
            return res.status(400).json({ message: 'NIP sudah terdaftar!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name: name,
            nip: nip,
            email: email,
            password: hashedPassword,
            role: 'driver' 
        });

        const newDriver = await Driver.create({
            user_id: newUser.id,
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

exports.getAllDrivers = async (req, res) => {
    try {
        const drivers = await Driver.findAll({
            include: [{
                model: User,
                attributes: ['name', 'nip', 'email'] 
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