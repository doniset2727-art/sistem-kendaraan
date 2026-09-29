const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Assignment = db.define('Assignment', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    booking_id: { type: DataTypes.BIGINT, allowNull: false },
    vehicle_id: { type: DataTypes.BIGINT, allowNull: false },
    driver_id: { type: DataTypes.BIGINT, allowNull: false },
    assigned_by: { type: DataTypes.BIGINT, allowNull: false },
    status: { type: DataTypes.ENUM('active', 'reassigned'), defaultValue: 'active' },
    reassigned_reason: { type: DataTypes.TEXT }
}, {
    tableName: 'assignments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Assignment;