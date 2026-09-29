const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/DepartmentController');

// Jika ada request POST ke URL ini, jalankan fungsi createDepartment
router.post('/', departmentController.createDepartment);

// Jika ada request GET ke URL ini, jalankan fungsi getAllDepartments
router.get('/', departmentController.getAllDepartments);

module.exports = router;