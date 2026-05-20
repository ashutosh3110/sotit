const Vendor = require('../models/Vendor');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const jwt = require('jsonwebtoken');

// @desc    Register Vendor (Step-wise or All-at-once)
// @route   POST /api/vendor/register
// @access  Public
exports.registerVendor = async (req, res, next) => {
  try {
    const data = req.body;
    
    // Check if mobile already exists
    const existingVendor = await Vendor.findOne({ mobile: data.mobile });
    if (existingVendor) {
      res.status(400);
      throw new Error('Mobile number already registered');
    }

    // Process Files
    const files = req.files;
    let uploads = {};

    const uploadFile = async (fileField, folder) => {
      if (files[fileField]) {
        const result = await cloudinary.uploader.upload(files[fileField][0].path, {
          folder: `sootit_vendors/${folder}`,
        });
        fs.unlinkSync(files[fileField][0].path);
        return { public_id: result.public_id, url: result.secure_url };
      }
      return null;
    };

    if (files) {
      uploads.profilePicture = await uploadFile('profilePicture', 'profiles');
      uploads.aadhaar = await uploadFile('aadhaar', 'kyc');
      uploads.pan = await uploadFile('pan', 'kyc');
      uploads.selfie = await uploadFile('selfie', 'kyc');
      uploads.policeVerification = await uploadFile('policeVerification', 'kyc');
      uploads.rcUpload = await uploadFile('rcUpload', 'vehicles');
      uploads.insuranceUpload = await uploadFile('insuranceUpload', 'vehicles');
    }

    // Parse nested JSON strings (if sent as strings from FormData)
    const professionalDetails = typeof data.professionalDetails === 'string' ? JSON.parse(data.professionalDetails) : data.professionalDetails;
    const address = typeof data.address === 'string' ? JSON.parse(data.address) : data.address;
    const banking = typeof data.banking === 'string' ? JSON.parse(data.banking) : data.banking;
    const vehicleInfo = typeof data.vehicleInfo === 'string' ? JSON.parse(data.vehicleInfo) : data.vehicleInfo;

    let sanitizedEmail = data.email;
    if (sanitizedEmail === "" || (typeof sanitizedEmail === 'string' && sanitizedEmail.trim() === "")) {
      sanitizedEmail = undefined;
    }

    // Create Vendor
    const vendor = await Vendor.create({
      name: data.name,
      mobile: data.mobile,
      email: sanitizedEmail,
      password: data.password || '123456',
      role: data.role || 'driver',
      profilePicture: uploads.profilePicture,
      address: {
        ...address,
        location: address.location // Expected { type: 'Point', coordinates: [lng, lat] }
      },
      professionalDetails,
      serviceRadius: data.serviceRadius,
      kyc: {
        aadhaar: uploads.aadhaar,
        pan: uploads.pan,
        selfie: uploads.selfie,
        policeVerification: uploads.policeVerification,
      },
      banking,
      vehicleInfo: {
        ...vehicleInfo,
        rcUpload: uploads.rcUpload,
        insuranceUpload: uploads.insuranceUpload,
      },
    });

    sendTokenResponse(vendor, 201, res);
  } catch (err) {
    // Clean up uploaded files on error
    if (req.files) {
      Object.values(req.files).forEach(fileArray => {
        if (fs.existsSync(fileArray[0].path)) fs.unlinkSync(fileArray[0].path);
      });
    }
    next(err);
  }
};

// @desc    Login Vendor with Mobile & Password
// @route   POST /api/vendor/login
// @access  Public
exports.vendorLogin = async (req, res, next) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      res.status(400);
      throw new Error('Please provide mobile and password');
    }

    const vendor = await Vendor.findOne({ mobile }).select('+password');
    if (!vendor) {
      res.status(401);
      throw new Error('Invalid mobile number');
    }

    const isMatch = await vendor.comparePassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid password');
    }

    sendTokenResponse(vendor, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Send OTP for Vendor (Forgot Password / Registration)
// @route   POST /api/vendor/send-otp
// @access  Public
exports.sendVendorOTP = async (req, res, next) => {
  try {
    const { mobile } = req.body;
    
    if (!mobile) {
      res.status(400);
      throw new Error('Please provide a mobile number');
    }

    const vendor = await Vendor.findOne({ mobile });
    
    const isRealOtp = process.env.REAL_OTP === 'true';
    const otp = isRealOtp ? Math.floor(1000 + Math.random() * 9000).toString() : '1234';
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    console.log("----------------------------");
    console.log(`VENDOR OTP for ${mobile}: ${otp}`);
    console.log("----------------------------");

    // Send OTP via SMS India Hub
    const smsService = require('../utils/smsService');
    const smsResult = await smsService.sendOTP(mobile, otp);

    if (vendor) {
      vendor.otp = otp;
      vendor.otpExpire = otpExpire;
      await vendor.save();
    }

    res.status(200).json({ 
      success: true, 
      message: smsResult.success ? (isRealOtp ? 'OTP sent successfully to your mobile' : 'Mock OTP generated successfully') : 'OTP sent successfully (Check console)',
      otp // keeping otp in response for testing/development if needed
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify OTP for Vendor Password Reset
// @route   POST /api/vendor/verify-reset-otp
// @access  Public
exports.verifyVendorResetOTP = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      res.status(400);
      throw new Error('Please provide mobile and OTP');
    }

    const vendor = await Vendor.findOne({ mobile });
    if (!vendor || vendor.otp !== otp || vendor.otpExpire < Date.now()) {
      res.status(400);
      throw new Error('Invalid or expired OTP');
    }

    res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset Vendor Password
// @route   POST /api/vendor/reset-password
// @access  Public
exports.resetVendorPassword = async (req, res, next) => {
  try {
    const { mobile, otp, password } = req.body;

    if (!mobile || !otp || !password) {
      res.status(400);
      throw new Error('Please provide all details');
    }

    const vendor = await Vendor.findOne({ mobile });
    if (!vendor || vendor.otp !== otp || vendor.otpExpire < Date.now()) {
      res.status(400);
      throw new Error('Invalid or expired OTP');
    }

    // Update password
    vendor.password = password;
    vendor.otp = undefined;
    vendor.otpExpire = undefined;
    await vendor.save();

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};

const sendTokenResponse = (vendor, statusCode, res) => {
  const token = jwt.sign({ id: vendor._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  res.status(statusCode).json({
    success: true,
    token,
    vendor: {
      id: vendor._id,
      name: vendor.name,
      role: vendor.role,
    }
  });
};
