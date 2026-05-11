const express = require('express');
const { getNotifications, markAsRead, clearAll } = require('../controllers/notificationController');
const router = express.Router();

router.get('/:userId', getNotifications);
router.put('/:notificationId/read', markAsRead);
router.delete('/:userId/clear', clearAll);

module.exports = router;
