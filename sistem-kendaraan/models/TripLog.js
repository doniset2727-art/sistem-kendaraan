const { DataTypes } = require('sequelize');
const db = require('../config/database');

const TripLog = db.define('TripLog', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    booking_id: { type: DataTypes.BIGINT, allowNull: false },
    driver_id: { type: DataTypes.BIGINT, allowNull: false },
    start_odometer: { type: DataTypes.INTEGER },
    end_odometer: { type: DataTypes.INTEGER },
    odometer_photo_url: { type: DataTypes.STRING(255) },
    fuel_cost: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    toll_cost: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    parking_cost: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    validation_status: { type: DataTypes.ENUM('pending', 'validated', 'rejected'), defaultValue: 'pending' },
    validated_by: { type: DataTypes.BIGINT },
    validation_note: { type: DataTypes.TEXT }
}, {
    tableName: 'trip_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = TripLog;