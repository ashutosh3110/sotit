const User = require('../models/User');
const OTPVerification = require('../models/OTPVerification');
const Vendor = require('../models/Vendor');
const jwt = require('jsonwebtoken');

const cloudinary = require('../utils/cloudinary');
const fs = require('fs');

// @desc    Send OTP to Mobile (For Forgot Password)
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOTP = async (req, res, next) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      res.status(400);
      throw new Error('Please provide a mobile number');
    }

    // Check if user exists for forgot password
    const user = await User.findOne({ mobile });
    if (!user) {
      res.status(404);
      throw new Error('No account found with this mobile number');
    }

    // Generate 4-digit OTP
    const isRealOtp = process.env.REAL_OTP === 'true';
    const otp = isRealOtp ? Math.floor(1000 + Math.random() * 9000).toString() : '1234';
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    console.log("----------------------------");
    console.log(`FORGOT PASSWORD OTP for ${mobile}: ${otp}`);
    console.log("----------------------------");

    // Send OTP via SMS India Hub
    const smsService = require('../utils/smsService');
    const smsResult = await smsService.sendOTP(mobile, otp, 'forget');

    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();

    res.status(200).json({
      success: true,
      message: smsResult.success ? (isRealOtp ? 'OTP sent successfully to your mobile' : 'Mock OTP generated successfully') : 'OTP sent successfully (Check console)',
      otp // keeping otp in response for testing/development if needed
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify OTP for Password Reset
// @route   POST /api/auth/verify-reset-otp
// @access  Public
exports.verifyResetOTP = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      res.status(400);
      throw new Error('Please provide mobile and OTP');
    }

    const user = await User.findOne({ mobile });
    const isRealOtp = process.env.REAL_OTP === 'true';
    if (isRealOtp) {
      if (!user || user.otp !== otp || user.otpExpire < Date.now()) {
        res.status(400);
        throw new Error('Invalid or expired OTP');
      }
    } else {
      if (otp !== '1234') {
        res.status(400);
        throw new Error('Invalid or expired OTP (Mock OTP is 1234)');
      }
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { mobile, otp, password } = req.body;

    if (!mobile || !otp || !password) {
      res.status(400);
      throw new Error('Please provide all details');
    }

    const user = await User.findOne({ mobile });
    const isRealOtp = process.env.REAL_OTP === 'true';
    if (isRealOtp) {
      if (!user || user.otp !== otp || user.otpExpire < Date.now()) {
        res.status(400);
        throw new Error('Invalid or expired OTP');
      }
    } else {
      if (otp !== '1234') {
        res.status(400);
        throw new Error('Invalid or expired OTP (Mock OTP is 1234)');
      }
    }

    // Update password
    user.password = password;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, mobile, location, otp } = req.body;

    if (!mobile || !password || !name || !otp) {
       res.status(400);
       throw new Error('Please provide name, mobile, password and OTP');
    }

    // Verify OTP
    const isRealOtp = process.env.REAL_OTP === 'true';
    if (isRealOtp) {
      const otpRecord = await OTPVerification.findOne({ mobile });
      if (!otpRecord || otpRecord.otp !== otp || otpRecord.otpExpire < Date.now()) {
        res.status(400);
        throw new Error('Invalid or expired OTP');
      }
    } else {
      if (otp !== '1234') {
        res.status(400);
        throw new Error('Invalid or expired OTP (Mock OTP is 1234)');
      }
    }

    // Check if mobile already exists
    const existingMobile = await User.findOne({ mobile });
    if (existingMobile) {
      res.status(400);
      throw new Error('Mobile number already registered');
    }

    let profilePicture = { public_id: '', url: '' };
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'sootit_profiles',
      });
      profilePicture = { public_id: result.public_id, url: result.secure_url };
      fs.unlinkSync(req.file.path);
    }

    let sanitizedEmail = email;
    if (sanitizedEmail === "" || (typeof sanitizedEmail === 'string' && sanitizedEmail.trim() === "")) {
      sanitizedEmail = undefined;
    }

    // Create user
    const user = await User.create({
      name,
      email: sanitizedEmail,
      password,
      mobile,
      location,
      profilePicture,
    });

    // Delete OTP record since it is verified
    await OTPVerification.deleteOne({ mobile });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(err);
  }
};

// @desc    Login user with Mobile & Password
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      res.status(400);
      throw new Error('Please provide mobile and password');
    }

    // Check for user
    const user = await User.findOne({ mobile }).select('+password');

    if (!user) {
      res.status(401);
      throw new Error('Invalid mobile number');
    }

    if (user.isBlocked) {
      res.status(403);
      throw new Error('Your account is blocked. Please contact support.');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid password');
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile (text + optional image)
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, location, mobile } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.location = location || user.location;
    user.mobile = mobile || user.mobile;

    // Handle profile picture upload
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (user.profilePicture && user.profilePicture.public_id) {
        await cloudinary.uploader.destroy(user.profilePicture.public_id);
      }
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'sootit_profiles',
      });
      user.profilePicture = { public_id: result.public_id, url: result.secure_url };
      fs.unlinkSync(req.file.path);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        walletBalance: user.walletBalance,
        location: user.location,
        profilePicture: user.profilePicture
      },
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(err);
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/delete-account
// @access  Private
exports.deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Optional: Delete user's profile picture from Cloudinary
    if (user.profilePicture && user.profilePicture.public_id) {
      await cloudinary.uploader.destroy(user.profilePicture.public_id);
    }

    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      location: user.location,
      role: user.role,
      walletBalance: user.walletBalance,
      profilePicture: user.profilePicture
    },
  });
};

// @desc    Send OTP for User Registration
// @route   POST /api/auth/register-send-otp
// @access  Public
exports.sendRegisterOTP = async (req, res, next) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      res.status(400);
      throw new Error('Please provide a mobile number');
    }

    // Check if mobile already exists in User collection
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      res.status(400);
      throw new Error('Mobile number already registered');
    }

    // Generate 4-digit OTP
    const isRealOtp = process.env.REAL_OTP === 'true';
    const otp = isRealOtp ? Math.floor(1000 + Math.random() * 9000).toString() : '1234';
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    console.log("----------------------------");
    console.log(`REGISTRATION OTP for ${mobile}: ${otp}`);
    console.log("----------------------------");

    // Send OTP via SMS India Hub
    const smsService = require('../utils/smsService');
    const smsResult = await smsService.sendOTP(mobile, otp, 'register');

    // Save to OTPVerification collection
    await OTPVerification.findOneAndUpdate(
      { mobile },
      { otp, otpExpire },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: smsResult.success ? (isRealOtp ? 'OTP sent successfully to your mobile' : 'Mock OTP generated successfully') : 'OTP sent successfully (Check console)',
      otp // keeping otp in response for testing/development if needed
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify OTP for Registration
// @route   POST /api/auth/verify-register-otp
// @access  Public
exports.verifyRegisterOTP = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      res.status(400);
      throw new Error('Please provide mobile and OTP');
    }

    const isRealOtp = process.env.REAL_OTP === 'true';
    if (isRealOtp) {
      const otpRecord = await OTPVerification.findOne({ mobile });
      if (!otpRecord || otpRecord.otp !== otp || otpRecord.otpExpire < Date.now()) {
        res.status(400);
        throw new Error('Invalid or expired OTP');
      }
    } else {
      if (otp !== '1234') {
        res.status(400);
        throw new Error('Invalid or expired OTP (Mock OTP is 1234)');
      }
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (err) {
    next(err);
  }
};

