const { DataTypes } = require('sequelize');
const db = require('../config/database');

// Mendefinisikan struktur tabel 'departments'
const Department = db.define('Department', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    }
}, {
    tableName: 'departments',
    timestamps: true, // Ini akan otomatis membuat kolom created_at dan updated_at
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Department;