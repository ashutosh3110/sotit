const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getTransactions, getAdminWalletData } = require('../controllers/walletController');
const { protect, adminProtect } = require('../middlewares/authMiddleware');

router.post('/create-order', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);
router.get('/transactions', protect, getTransactions);
router.get('/admin/data', adminProtect, getAdminWalletData);

module.exports = router;
