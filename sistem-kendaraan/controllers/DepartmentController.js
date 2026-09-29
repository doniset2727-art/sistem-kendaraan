const Department = require('../models/Department');

// Fungsi untuk menambahkan Departemen Baru (Create)
exports.createDepartment = async (req, res) => {
    try {
        const { name } = req.body; // Menerima data nama dari request pengguna

        // Validasi jika nama kosong
        if (!name) {
            return res.status(400).json({ status: 'Gagal', message: 'Nama departemen harus diisi!' });
        }

        // Menyimpan ke database
        const newDept = await Department.create({ name });

        return res.status(201).json({ 
            status: 'Sukses', 
            message: 'Departemen berhasil ditambahkan', 
            data: newDept 
        });
    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }
};

// Fungsi untuk melihat semua daftar Departemen (Read)
exports.getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.findAll();
        return res.status(200).json({ 
            status: 'Sukses', 
            data: departments 
        });
    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }
};