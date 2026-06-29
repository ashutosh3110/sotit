const Language = require('../models/Language');
const RegistrationField = require('../models/RegistrationField');
const VehicleType = require('../models/VehicleType');

// @desc    Get active configuration (languages and fields)
// @route   GET /api/registration-config/public
// @access  Public
exports.getPublicConfig = async (req, res, next) => {
  try {
    const languages = await Language.find({ isActive: true }).sort({ name: 1 });
    const fields = await RegistrationField.find({ isActive: true }).sort({ createdAt: 1 });
    const vehicleTypes = await VehicleType.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      languages,
      fields,
      vehicleTypes
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all languages
// @route   GET /api/registration-config/languages
// @access  Private/Admin
exports.getLanguages = async (req, res, next) => {
  try {
    const languages = await Language.find({}).sort({ name: 1 });
    res.status(200).json({ success: true, languages });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new language
// @route   POST /api/registration-config/languages
// @access  Private/Admin
exports.createLanguage = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Language name is required' });
    }

    const language = await Language.create({ name: name.trim() });
    res.status(201).json({ success: true, language });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Language already exists' });
    }
    next(err);
  }
};

// @desc    Delete a language
// @route   DELETE /api/registration-config/languages/:id
// @access  Private/Admin
exports.deleteLanguage = async (req, res, next) => {
  try {
    const language = await Language.findByIdAndDelete(req.params.id);
    if (!language) {
      return res.status(404).json({ success: false, message: 'Language not found' });
    }
    res.status(200).json({ success: true, message: 'Language deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all registration fields
// @route   GET /api/registration-config/fields
// @access  Private/Admin
exports.getRegistrationFields = async (req, res, next) => {
  try {
    const fields = await RegistrationField.find({}).sort({ createdAt: 1 });
    res.status(200).json({ success: true, fields });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new registration field
// @route   POST /api/registration-config/fields
// @access  Private/Admin
exports.createRegistrationField = async (req, res, next) => {
  try {
    const { label, name, type, options, role, required, placeholder } = req.body;
    if (!label || !name || !type) {
      return res.status(400).json({ success: false, message: 'Label, Name (camelCase identifier), and Type are required' });
    }

    const field = await RegistrationField.create({
      label: label.trim(),
      name: name.trim(),
      type,
      options: options || [],
      role: role || 'all',
      required: !!required,
      placeholder: placeholder ? placeholder.trim() : ''
    });

    res.status(201).json({ success: true, field });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a registration field
// @route   DELETE /api/registration-config/fields/:id
// @access  Private/Admin
exports.deleteRegistrationField = async (req, res, next) => {
  try {
    const field = await RegistrationField.findByIdAndDelete(req.params.id);
    if (!field) {
      return res.status(404).json({ success: false, message: 'Registration field not found' });
    }
    res.status(200).json({ success: true, message: 'Registration field deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all vehicle types
// @route   GET /api/registration-config/vehicle-types
// @access  Private/Admin
exports.getVehicleTypes = async (req, res, next) => {
  try {
    const vehicleTypes = await VehicleType.find({}).sort({ name: 1 });
    res.status(200).json({ success: true, vehicleTypes });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new vehicle type
// @route   POST /api/registration-config/vehicle-types
// @access  Private/Admin
exports.createVehicleType = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Vehicle type name is required' });
    }

    const vehicleType = await VehicleType.create({ name: name.trim() });
    res.status(201).json({ success: true, vehicleType });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Vehicle type already exists' });
    }
    next(err);
  }
};

// @desc    Delete a vehicle type
// @route   DELETE /api/registration-config/vehicle-types/:id
// @access  Private/Admin
exports.deleteVehicleType = async (req, res, next) => {
  try {
    const vehicleType = await VehicleType.findByIdAndDelete(req.params.id);
    if (!vehicleType) {
      return res.status(404).json({ success: false, message: 'Vehicle type not found' });
    }
    res.status(200).json({ success: true, message: 'Vehicle type deleted successfully' });
  } catch (err) {
    next(err);
  }
};
