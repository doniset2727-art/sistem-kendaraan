const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

// Jalur untuk mendaftar user baru
router.post('/register', userController.createUser);

/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: Login untuk mendapatkan Token JWT
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: siti.staff@perusahaan.com
 *               password:
 *                 type: string
 *                 example: rahasia_siti
 *     responses:
 *       200:
 *         description: Login berhasil dan mengembalikan Token
 *       401:
 *         description: Password salah
 *       404:
 *         description: Email tidak ditemukan
 */

// Jalur untuk login (TAMBAHKAN BARIS INI)
router.post('/login', userController.login);

module.exports = router;