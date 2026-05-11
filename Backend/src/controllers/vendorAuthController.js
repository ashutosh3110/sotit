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

    // Create Vendor
    const vendor = await Vendor.create({
      name: data.name,
      mobile: data.mobile,
      email: data.email,
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

// @desc    Send OTP for Vendor
// @route   POST /api/vendor/send-otp
exports.sendVendorOTP = async (req, res, next) => {
  try {
    const { mobile, isRegistration } = req.body;
    if (isRegistration) {
      const exists = await Vendor.findOne({ mobile });
      if (exists) {
        res.status(400);
        throw new Error('Mobile already registered');
      }
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`VENDOR OTP for ${mobile}: ${otp}`);

    global.vendorOTPs = global.vendorOTPs || {};
    global.vendorOTPs[mobile] = otp;

    res.status(200).json({ success: true, message: 'OTP sent to terminal' });
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
