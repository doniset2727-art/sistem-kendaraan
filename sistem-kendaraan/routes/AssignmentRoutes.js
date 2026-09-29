const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/AssignmentController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// HANYA Admin (atau Kepala Bagian) yang boleh menugaskan mobil
router.post('/', verifyToken, verifyRole('admin', 'manager'), assignmentController.createAssignment);

module.exports = router;