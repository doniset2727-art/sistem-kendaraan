const Driver = require('../models/Driver');
const User = require('../models/User');

// Fungsi untuk melengkapi profil Supir
exports.createDriver = async (req, res) => {
    try {
        const { user_id, sim_number, sim_expiry } = req.body;

        // 1. Validasi: Pastikan user-nya ada dan jabatannya memang 'driver'
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ status: 'Gagal', message: 'Akun user tidak ditemukan!' });
        }
        if (user.role !== 'driver') {
            return res.status(400).json({ status: 'Gagal', message: 'Akun ini bukan seorang supir!' });
        }

        // 2. Cek apakah profil supir untuk user ini sudah pernah dibuat
        const existingDriver = await Driver.findOne({ where: { user_id } });
        if (existingDriver) {
            return res.status(400).json({ status: 'Gagal', message: 'Profil supir untuk akun ini sudah ada!' });
        }

        // 3. Simpan data SIM ke database
        const newDriver = await Driver.create({
            user_id,
            sim_number,
            sim_expiry,
            status: 'available'
        });

        return res.status(201).json({
            status: 'Sukses',
            message: 'Profil supir berhasil ditambahkan!',
            data: newDriver
        });

    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }
};