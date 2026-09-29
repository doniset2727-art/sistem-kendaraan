const Vehicle = require('../models/Vehicle');

// Fungsi untuk menambahkan mobil baru ke garasi
exports.createVehicle = async (req, res) => {
    try {
        const { license_plate, brand_model, type, status, current_odometer } = req.body;

        // Validasi plat nomor tidak boleh kosong
        if (!license_plate || !brand_model) {
            return res.status(400).json({ status: 'Gagal', message: 'Plat nomor dan Tipe Mobil wajib diisi!' });
        }

        // Cek apakah plat nomor sudah ada di database
        const existingCar = await Vehicle.findOne({ where: { license_plate } });
        if (existingCar) {
            return res.status(400).json({ status: 'Gagal', message: 'Mobil dengan plat nomor ini sudah terdaftar!' });
        }

        // Simpan ke database
        const newVehicle = await Vehicle.create({
            license_plate,
            brand_model,
            type,
            status: status || 'available',
            current_odometer: current_odometer || 0
        });

        return res.status(201).json({
            status: 'Sukses',
            message: 'Mobil baru berhasil ditambahkan ke garasi!',
            data: newVehicle
        });

    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }
};

// Fungsi untuk mengambil semua data kendaraan
exports.getAllVehicles = async (req, res) => {
    try {
        // Mengambil seluruh data dari tabel Vehicles
        const vehicles = await Vehicle.findAll();
        
        return res.status(200).json({
            status: 'Sukses',
            message: 'Berhasil mengambil data kendaraan',
            data: vehicles
        });
    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }
};