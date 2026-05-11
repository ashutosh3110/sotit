const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

exports.adminProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized to access this route'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await Admin.findById(decoded.id);
    if (!req.admin) {
        res.status(401);
        return next(new Error('Admin not found'));
    }
    next();
  } catch (err) {
    res.status(401);
    return next(new Error('Not authorized to access this route'));
  }
};
