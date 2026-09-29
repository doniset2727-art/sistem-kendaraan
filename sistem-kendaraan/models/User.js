const { DataTypes } = require('sequelize');
const db = require('../config/database');

const User = db.define('User', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    phone: { type: DataTypes.STRING(20) },
    password: { type: DataTypes.STRING(255), allowNull: false },
    role: { 
        type: DataTypes.ENUM('staff', 'manager', 'head_of_vehicle', 'driver', 'admin'),
        allowNull: false 
    },
    // Kolom relasi kita siapkan di sini
    department_id: { type: DataTypes.BIGINT },
    manager_id: { type: DataTypes.BIGINT }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = User;