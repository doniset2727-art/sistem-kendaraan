const { DataTypes } = require('sequelize');
const db = require('../config/database');

const TripReceipt = db.define('TripReceipt', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    trip_log_id: { type: DataTypes.BIGINT, allowNull: false },
    receipt_type: { type: DataTypes.ENUM('fuel', 'toll', 'parking'), allowNull: false },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    photo_url: { type: DataTypes.STRING(255), allowNull: false }
}, {
    tableName: 'trip_receipts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = TripReceipt;