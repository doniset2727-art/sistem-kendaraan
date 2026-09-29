const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Driver = db.define('Driver', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.BIGINT, allowNull: false, unique: true },
    sim_number: { type: DataTypes.STRING(50), allowNull: false },
    sim_expiry: { type: DataTypes.DATEONLY, allowNull: false }, // DateOnly karena hanya butuh tanggal
    status: { type: DataTypes.ENUM('available', 'on_duty', 'off'), defaultValue: 'available' }
}, {
    tableName: 'drivers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Driver;