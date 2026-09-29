const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

// Jalur untuk mendaftar user baru
router.post('/register', userController.createUser);

// Jalur untuk login (TAMBAHKAN BARIS INI)
router.post('/login', userController.login);

module.exports = router;