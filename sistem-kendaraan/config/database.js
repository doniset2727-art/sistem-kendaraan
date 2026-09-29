const { Sequelize } = require('sequelize');
require('dotenv').config();

// Konfigurasi koneksi ke MySQL
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false, // diset false agar terminal CMD tidak terlalu penuh dengan teks
    }
);

module.exports = sequelize;