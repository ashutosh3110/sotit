const express = require('express');
const router = express.Router();
const { createSubscriptionOrder, verifySubscriptionPayment } = require('../controllers/subscriptionController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/create-order', protect, createSubscriptionOrder);
router.post('/verify-payment', protect, verifySubscriptionPayment);

module.exports = router;
