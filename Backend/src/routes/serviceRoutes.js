const express = require('express');
const router = express.Router();
const { hireExpert, acceptRequest, getVendorRequests, getVendorHistory, getUserHistory, updateFCMToken, sendTestNotification, submitVendorRating, checkDriverRatings, getProfileData } = require('../controllers/serviceController');
const { createHireOrder, verifyHirePayment, createAcceptanceOrder, verifyAcceptancePayment, createSubscriptionOrder, verifySubscriptionPayment } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/create-payment', protect, createHireOrder);
router.post('/verify-payment', protect, verifyHirePayment);
router.post('/create-acceptance-payment', protect, createAcceptanceOrder);
router.post('/verify-acceptance-payment', protect, verifyAcceptancePayment);
router.post('/create-subscription-payment', protect, createSubscriptionOrder);
router.post('/verify-subscription-payment', protect, verifySubscriptionPayment);
router.get('/profile-data', protect, getProfileData);
router.post('/hire', protect, hireExpert);
router.post('/accept', protect, acceptRequest);
router.get('/vendor/requests', protect, getVendorRequests);
router.get('/vendor/history', protect, getVendorHistory);
router.get('/user/history', protect, getUserHistory);
router.put('/update-fcm', protect, updateFCMToken);
router.post('/register-fcm', protect, updateFCMToken); // Alias for registration
router.post('/test-notification', protect, sendTestNotification);
router.post('/rate', protect, submitVendorRating);
router.get('/process-driver-ratings', checkDriverRatings);

module.exports = router;
