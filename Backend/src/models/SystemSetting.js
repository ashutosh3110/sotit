const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema({
  platformName: {
    type: String,
    default: 'Sootit Admin',
  },
  systemCurrency: {
    type: String,
    default: 'INR (₹)',
  },
  supportEmail: {
    type: String,
    default: 'support@sootit.com',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
