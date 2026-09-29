const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/AssignmentController');

// Jalur untuk membuat penugasan baru
router.post('/', assignmentController.createAssignment);

module.exports = router;