const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// @desc    Login Admin
// @route   POST /api/admin/login
// @access  Public
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide an email and password');
    }

    // Check for admin
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      res.status(401);
      throw new Error('Invalid Admin credentials');
    }

    // Check if password matches
    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid Admin credentials');
    }

    sendTokenResponse(admin, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Update Admin Profile
// @route   PUT /api/admin/profile
// @access  Private (Admin)
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, oldPassword, newPassword } = req.body;
    const adminId = req.admin.id; // Assuming admin is attached to req by auth middleware

    const admin = await Admin.findById(adminId).select('+password');

    if (!admin) {
      res.status(404);
      throw new Error('Admin not found');
    }

    // Update name and email if provided
    if (name) admin.name = name;
    if (email) admin.email = email;

    // Update password if oldPassword and newPassword are provided
    if (oldPassword && newPassword) {
      const isMatch = await admin.matchPassword(oldPassword);
      if (!isMatch) {
        res.status(401);
        throw new Error('Old password is incorrect');
      }
      admin.password = newPassword;
    }

    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update Admin FCM Token
// @route   PUT /api/admin/update-fcm
// @access  Private (Admin)
exports.updateFCMToken = async (req, res, next) => {
    try {
        const { fcmToken } = req.body;
        const adminId = req.admin.id;

        await Admin.findByIdAndUpdate(adminId, { fcmToken });

        res.status(200).json({ success: true, message: 'Admin FCM Token updated' });
    } catch (error) {
        next(error);
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (admin, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  res.status(statusCode).json({
    success: true,
    token,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
};
