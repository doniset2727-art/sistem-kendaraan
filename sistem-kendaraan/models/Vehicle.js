const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Vehicle = db.define('Vehicle', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    license_plate: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    brand_model: { type: DataTypes.STRING(100), allowNull: false },
    type: { type: DataTypes.ENUM('sedan', 'mpv', 'suv', 'van', 'minibus'), allowNull: false },
    status: { type: DataTypes.ENUM('available', 'in_use', 'maintenance', 'out_of_service'), defaultValue: 'available' },
    current_odometer: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
    tableName: 'vehicles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Vehicle;