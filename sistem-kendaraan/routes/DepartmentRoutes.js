const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/DepartmentController');

// PANGGIL KEDUA SATPAM KITA
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// Rute ini dijaga 2 Satpam: Harus login (verifyToken) DAN jabatannya harus 'admin' (verifyRole)
router.post('/', verifyToken, verifyRole('admin'), departmentController.createDepartment);

/**
 * @swagger
 * /api/v1/departments:
 *   get:
 *     summary: Mendapatkan semua daftar departemen
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []  # INI ADALAH KODE UNTUK MEMANGGIL SATPAM (TOKEN JWT)
 *     responses:
 *       200:
 *         description: Berhasil mengambil data departemen
 *       401:
 *         description: Akses ditolak (Token tidak ada atau tidak valid)
 */

// Rute ini dijaga 1 Satpam: Hanya perlu login saja
router.get('/', verifyToken, departmentController.getAllDepartments);

module.exports = router;