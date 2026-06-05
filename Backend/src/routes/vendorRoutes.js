const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { registerVendor, getVendorProfile, updateVendorProfile, updateVendorKYC, toggleStatus, getVendors, deleteVendorAccount } = require('../controllers/vendorController');
const { vendorLogin, sendVendorOTP, verifyVendorResetOTP, resetVendorPassword } = require('../controllers/vendorAuthController');

router.post('/send-otp', sendVendorOTP);
router.post('/verify-reset-otp', verifyVendorResetOTP);
router.post('/reset-password', resetVendorPassword);

const { storage } = require('../config/cloudinary');

const upload = multer({ storage });

// Register Route with multi-file support
router.post('/register', upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'aadhaar', maxCount: 1 },
    { name: 'pan', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
    { name: 'policeVerification', maxCount: 1 },
    { name: 'dlFile', maxCount: 1 },
    { name: 'garagePhoto', maxCount: 1 },
    { name: 'shopLicense', maxCount: 1 },
    { name: 'barCertificate', maxCount: 1 },
    { name: 'advocateId', maxCount: 1 }
]), registerVendor);

router.post('/login', vendorLogin);
router.get('/profile/:id', getVendorProfile);
router.put('/profile/:id', updateVendorProfile);
router.put('/kyc/:id', upload.fields([
    { name: 'aadhaar', maxCount: 1 },
    { name: 'pan', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
    { name: 'dlFile', maxCount: 1 },
    { name: 'garagePhoto', maxCount: 1 },
    { name: 'shopLicense', maxCount: 1 },
    { name: 'barCertificate', maxCount: 1 },
    { name: 'advocateId', maxCount: 1 },
    { name: 'regCertificate', maxCount: 1 },
    { name: 'officeProof', maxCount: 1 }
]), updateVendorKYC);

const { optionalProtect, protect } = require('../middlewares/authMiddleware');

router.get('/all', optionalProtect, getVendors);
router.put('/:id/toggle-status', toggleStatus);
router.delete('/delete-account', protect, deleteVendorAccount);

module.exports = router;
