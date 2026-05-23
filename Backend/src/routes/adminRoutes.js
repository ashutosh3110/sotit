const express = require('express');
const { adminLogin, updateProfile, updateFCMToken } = require('../controllers/adminAuthController');
const { getPendingVendors, getAllVendors, getAllUsers, getMasterDirectory, updateVendorStatus, toggleVendorBlock, updateVendorRating, toggleUserBlock } = require('../controllers/adminController');
const { adminProtect } = require('../middlewares/adminAuthMiddleware');

const router = express.Router();
console.log("Admin Routes Initialized");

router.post('/login', adminLogin);
router.put('/profile', adminProtect, updateProfile);
router.put('/update-fcm', adminProtect, updateFCMToken);

// Management
router.get('/test', (req, res) => res.json({ message: "Admin routes working" }));
router.get('/users', adminProtect, getAllUsers);
router.put('/users/:userId/toggle-block', adminProtect, toggleUserBlock);
router.get('/vendors', adminProtect, getAllVendors);
router.get('/vendors/pending', adminProtect, getPendingVendors);
router.put('/vendors/:vendorId/status', adminProtect, updateVendorStatus);
router.put('/vendors/:vendorId/toggle-block', adminProtect, toggleVendorBlock);
router.put('/vendors/:vendorId/update-rating', adminProtect, updateVendorRating);

module.exports = router;
