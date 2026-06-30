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
  subscriptionDaily: {
    type: Number,
    default: 99,
  },
  subscriptionMonthly: {
    type: Number,
    default: 999,
  },
  subscriptionYearly: {
    type: Number,
    default: 9999,
  },
  hireExpertFee: {
    type: Number,
    default: 5,
  },
  singleUnlockFee: {
    type: Number,
    default: 9,
  },
  leadAcceptanceFee: {
    type: Number,
    default: 9,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
