const Notification = require('../models/Notification');

// 1. Fungsi untuk mengambil semua notifikasi milik 1 user
exports.getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;

        const notifications = await Notification.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']] // Urutkan dari yang paling baru
        });

        return res.status(200).json({
            status: 'Sukses',
            data: notifications
        });

    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }
};

// 2. Fungsi untuk menandai notifikasi sudah dibaca
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params; // ID notifikasinya

        const notification = await Notification.findByPk(id);
        if (!notification) {
            return res.status(404).json({ status: 'Gagal', message: 'Notifikasi tidak ditemukan!' });
        }

        notification.is_read = true;
        await notification.save();

        return res.status(200).json({
            status: 'Sukses',
            message: 'Notifikasi telah ditandai dibaca',
            data: notification
        });

    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }
};

// 3. Fungsi untuk membuat notifikasi baru (Untuk simulasi/testing)
exports.createNotification = async (req, res) => {
    try {
        const { user_id, title, message, type } = req.body;

        const newNotif = await Notification.create({
            user_id,
            title,
            message,
            type
        });

        return res.status(201).json({
            status: 'Sukses',
            message: 'Notifikasi berhasil dikirim!',
            data: newNotif
        });

    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }
};