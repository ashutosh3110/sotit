const User = require('../models/User');
const jwt = require('jsonwebtoken');

const cloudinary = require('../utils/cloudinary');
const fs = require('fs');

// @desc    Send OTP to Mobile
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOTP = async (req, res, next) => {
  try {
    const { mobile, email, isRegistration } = req.body;

    if (!mobile) {
      res.status(400);
      throw new Error('Please provide a mobile number');
    }

    // If it's registration, check if mobile or email already exists
    if (isRegistration) {
      const existingMobile = await User.findOne({ mobile });
      if (existingMobile) {
        res.status(400);
        throw new Error('Mobile number already registered');
      }

      if (email) {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
          res.status(400);
          throw new Error('Email already registered');
        }
      }
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    console.log("----------------------------");
    console.log(`OTP for ${mobile}: ${otp}`);
    console.log("----------------------------");

    let user = await User.findOne({ mobile });
    if (user) {
      user.otp = otp;
      user.otpExpire = otpExpire;
      await user.save();
    } else {
      // For registration, we don't have a user yet.
      // In a real app, you'd store this OTP in Redis or a Temp collection with the mobile as key.
      // For this demo, we'll assume the frontend will send it back or we can verify it against terminal.
      // But we need to store it somewhere to verify later in 'register'
      
      // Let's create a "temporary" record or just return it for now (simulated).
      // Actually, let's just use a simple global object for OTPs if user doesn't exist
      // because we don't want to create the user until OTP is verified.
      global.tempOTPs = global.tempOTPs || {};
      global.tempOTPs[mobile] = otp;
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to terminal',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Register user with OTP
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, mobile, location, otp } = req.body;

    if (!otp) {
       res.status(400);
       throw new Error('Please provide OTP');
    }

    // Verify OTP for registration
    if (global.tempOTPs && global.tempOTPs[mobile]) {
      if (global.tempOTPs[mobile] !== otp) {
        res.status(400);
        throw new Error('Invalid OTP');
      }
      // Clear temp OTP
      delete global.tempOTPs[mobile];
    } else {
       res.status(400);
       throw new Error('OTP expired or not sent');
    }

    let profilePicture = { public_id: '', url: '' };
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'sootit_profiles',
      });
      profilePicture = { public_id: result.public_id, url: result.secure_url };
      fs.unlinkSync(req.file.path);
    }

    // Create user
    const user = await User.create({
      name,
      email, // Optional
      password: password || '123456', // Default if not provided
      role: role || 'user',
      mobile,
      location,
      profilePicture,
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(err);
  }
};

// @desc    Login user with Mobile & OTP
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      res.status(400);
      throw new Error('Please provide mobile and OTP');
    }

    // Check for user
    const user = await User.findOne({ mobile });

    if (!user) {
      res.status(401);
      throw new Error('Invalid mobile number');
    }

    // Verify OTP (Check if it matches what was sent to terminal)
    // In sendOTP, we saved it to the user object.
    if (user.otp !== otp) {
      res.status(401);
      throw new Error('Invalid OTP');
    }

    // Clear OTP
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
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
        location: user.location
      },
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
    },
  });
};
