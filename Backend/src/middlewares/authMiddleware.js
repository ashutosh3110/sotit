const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vendor = require('../models/Vendor');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
        // Check if it's a vendor
        const vendor = await Vendor.findById(decoded.id);
        if (vendor) {
            req.vendor = vendor;
            req.user = vendor; // For compatibility
            return next();
        }
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

exports.vendorProtect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.vendor = await Vendor.findById(decoded.id);
        if (!req.vendor) {
            return res.status(401).json({ success: false, message: 'Vendor not found' });
        }
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
};
const Admin = require('../models/Admin');

exports.adminProtect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = await Admin.findById(decoded.id);
        if (!req.admin) {
            return res.status(401).json({ success: false, message: 'Admin not found' });
        }
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
};
