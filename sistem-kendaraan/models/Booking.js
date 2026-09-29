const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Booking = db.define('Booking', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    booking_code: { type: DataTypes.STRING(50), unique: true },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    approver_id: { type: DataTypes.BIGINT },
    destination_type: { type: DataTypes.ENUM('dalam_kota', 'luar_kota'), allowNull: false },
    destination_address: { type: DataTypes.TEXT, allowNull: false },
    purpose: { type: DataTypes.TEXT, allowNull: false },
    is_carrying_goods: { type: DataTypes.BOOLEAN, defaultValue: false },
    goods_description: { type: DataTypes.TEXT },
    return_status: { type: DataTypes.ENUM('kembali_ke_perusahaan', 'tidak_kembali') },
    start_time: { type: DataTypes.DATE, allowNull: false },
    end_time: { type: DataTypes.DATE, allowNull: false },
    status: { 
        type: DataTypes.ENUM('pending_approval', 'pending_assignment', 'assigned', 'on_going', 'completed', 'rejected', 'cancelled'), 
        defaultValue: 'pending_approval' 
    },
    rejection_reason: { type: DataTypes.TEXT }
}, {
    tableName: 'bookings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Booking;