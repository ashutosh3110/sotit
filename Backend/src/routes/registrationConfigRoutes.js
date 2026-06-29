const express = require('express');
const {
  getPublicConfig,
  getLanguages,
  createLanguage,
  deleteLanguage,
  getRegistrationFields,
  createRegistrationField,
  deleteRegistrationField,
  getVehicleTypes,
  createVehicleType,
  deleteVehicleType
} = require('../controllers/registrationConfigController');
const { adminProtect } = require('../middlewares/adminAuthMiddleware');

const router = express.Router();

// Public route to fetch config
router.get('/public', getPublicConfig);

// Languages management (Admin)
router.route('/languages')
  .get(adminProtect, getLanguages)
  .post(adminProtect, createLanguage);

router.delete('/languages/:id', adminProtect, deleteLanguage);

// Vehicle Types management (Admin)
router.route('/vehicle-types')
  .get(adminProtect, getVehicleTypes)
  .post(adminProtect, createVehicleType);

router.delete('/vehicle-types/:id', adminProtect, deleteVehicleType);

// Fields management (Admin)
router.route('/fields')
  .get(adminProtect, getRegistrationFields)
  .post(adminProtect, createRegistrationField);

router.delete('/fields/:id', adminProtect, deleteRegistrationField);

module.exports = router;
