const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/DepartmentController');

// PANGGIL KEDUA SATPAM KITA
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// Rute ini dijaga 2 Satpam: Harus login (verifyToken) DAN jabatannya harus 'admin' (verifyRole)
router.post('/', verifyToken, verifyRole('admin'), departmentController.createDepartment);

// Rute ini dijaga 1 Satpam: Hanya perlu login saja
router.get('/', verifyToken, departmentController.getAllDepartments);

module.exports = router;