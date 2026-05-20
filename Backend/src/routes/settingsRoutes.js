const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { adminProtect } = require('../middlewares/adminAuthMiddleware');

const router = express.Router();

router.get('/', getSettings);
router.put('/', adminProtect, updateSettings);

module.exports = router;
