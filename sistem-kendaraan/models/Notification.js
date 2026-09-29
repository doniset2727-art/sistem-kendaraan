const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Notification = db.define('Notification', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    title: { type: DataTypes.STRING(150), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.STRING(50) },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Notification;