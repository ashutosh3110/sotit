const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true, // Allows multiple null/missing values
  },
  role: {
    type: String,
    enum: ['user', 'vendor', 'admin', 'owner'],
    default: 'user',
  },
  mobile: {
    type: String,
    required: [true, 'Please add a mobile number'],
    unique: true,
  },
  profilePicture: {
    public_id: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      default: '',
    },
  },
  location: {
    type: String,
    default: '',
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  walletBalance: {
    type: Number,
    default: 0,
  },
  otp: String,
  otpExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true
});

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
