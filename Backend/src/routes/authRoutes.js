const express = require('express');
const { register, login, sendOTP, updateProfile, verifyResetOTP, resetPassword, sendRegisterOTP, verifyRegisterOTP, deleteAccount, sendLoginOTP, loginVerifyOTP } = require('../controllers/authController');
const upload = require('../middlewares/upload');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/send-otp', sendOTP);
router.post('/register-send-otp', sendRegisterOTP);
router.post('/verify-register-otp', verifyRegisterOTP);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);
router.post('/login-send-otp', sendLoginOTP);
router.post('/login-verify-otp', loginVerifyOTP);
router.post('/register', upload.single('profilePicture'), register);
router.post('/login', login);
router.put('/profile', protect, upload.single('profilePicture'), updateProfile);
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;
