const mongoose = require('mongoose');

const otpVerificationSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    unique: true
  },
  otp: {
    type: String,
    required: true
  },
  otpExpire: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Auto-delete OTP documents after 10 minutes (600 seconds)
otpVerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

module.exports = mongoose.model('OTPVerification', otpVerificationSchema);
