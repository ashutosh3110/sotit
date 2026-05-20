const SystemSetting = require('../models/SystemSetting');

// @desc    Get system settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res, next) => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = await SystemSetting.create({});
    }
    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private (Admin)
const updateSettings = async (req, res, next) => {
  try {
    const { platformName, systemCurrency, supportEmail } = req.body;
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = new SystemSetting();
    }

    if (platformName !== undefined) settings.platformName = platformName;
    if (systemCurrency !== undefined) settings.systemCurrency = systemCurrency;
    if (supportEmail !== undefined) settings.supportEmail = supportEmail;

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'System settings updated successfully',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
