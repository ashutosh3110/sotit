const express = require('express');
const { adminLogin, updateProfile } = require('../controllers/adminAuthController');
const { getPendingVendors, getAllVendors, getAllUsers, getMasterDirectory, updateVendorStatus } = require('../controllers/adminController');
const { adminProtect } = require('../middlewares/adminAuthMiddleware');

const router = express.Router();
console.log("Admin Routes Initialized");

router.post('/login', adminLogin);
router.put('/profile', adminProtect, updateProfile);

// Management
router.get('/test', (req, res) => res.json({ message: "Admin routes working" }));
router.get('/users', adminProtect, getAllUsers);
router.get('/vendors', adminProtect, getAllVendors);
router.get('/vendors/pending', adminProtect, getPendingVendors);
router.put('/vendors/:vendorId/status', adminProtect, updateVendorStatus);

module.exports = router;
