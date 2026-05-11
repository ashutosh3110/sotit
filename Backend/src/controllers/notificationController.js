const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .limit(20);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        await Notification.findByIdAndUpdate(notificationId, { isRead: true });
        res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification' });
    }
};

exports.clearAll = async (req, res) => {
    try {
        const { userId } = req.params;
        await Notification.deleteMany({ recipient: userId });
        res.status(200).json({ message: 'All notifications cleared' });
    } catch (error) {
        res.status(500).json({ message: 'Error clearing notifications' });
    }
};
