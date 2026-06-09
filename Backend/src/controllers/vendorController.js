const Vendor = require('../models/Vendor');
const User = require('../models/User');
const ServiceRequest = require('../models/ServiceRequest');
const bcrypt = require('bcryptjs');

exports.sendOTP = async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) return res.status(400).json({ message: 'Mobile number is required' });

  const otp = Math.floor(1000 + Math.random() * 9000);
  console.log(`\n--- [VENDOR OTP] ---`);
  console.log(`Mobile: ${mobile}`);
  console.log(`OTP: ${otp}`);
  console.log(`--------------------\n`);

  res.status(200).json({ message: 'OTP sent successfully (Check backend console)', otp }); 
};
exports.registerVendor = async (req, res) => {
  try {
    const { 
        name, mobile, email, password, role, 
        address, liveLocation, 
        profData, mechanicData, rtoData, legalData, ownerData,
        bankData,
        otp,
        remark,
        customFields
    } = req.body;

    if (role !== 'owner') {
      if (!mobile || !otp) {
        return res.status(400).json({ message: 'Mobile and OTP are required' });
      }

      // Verify OTP
      const OTPVerification = require('../models/OTPVerification');
      const otpRecord = await OTPVerification.findOne({ mobile });
      if (!otpRecord || otpRecord.otp !== otp || otpRecord.otpExpire < Date.now()) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }
    } else {
      if (!mobile) {
        return res.status(400).json({ message: 'Mobile number is required' });
      }
    }

    // Check if user exists
    if (email) {
      const existingEmail = await Vendor.findOne({ email });
      if (existingEmail) return res.status(400).json({ message: 'Vendor with this email already exists' });
    }
    
    const existingMobile = await Vendor.findOne({ mobile });
    if (existingMobile) {
      return res.status(400).json({ message: 'Vendor with this mobile already exists' });
    }

    // Prepare Document paths from req.files (if any)
    const docs = {};
    if (req.files) {
        console.log("\n--- [UPLOADED FILES TO CLOUDINARY] ---");
        Object.keys(req.files).forEach(key => {
            const filePath = req.files[key][0].path;
            docs[key] = filePath;
            console.log(`${key}: ${filePath}`);
        });
        console.log("--------------------------------------\n");
    }

    // Create Vendor
    const newVendor = new Vendor({
      name,
      mobile,
      email: email || undefined,
      password, // Hashing is handled by model pre-save hook
      role,
      address: address ? JSON.parse(address) : {},
      liveLocation: liveLocation ? JSON.parse(liveLocation) : null,
      professionalDetails: profData ? JSON.parse(profData) : {},
      mechanicDetails: mechanicData ? JSON.parse(mechanicData) : {},
      rtoDetails: rtoData ? JSON.parse(rtoData) : {},
      legalDetails: legalData ? JSON.parse(legalData) : {},
      ownerDetails: ownerData ? JSON.parse(ownerData) : {},
      bankDetails: bankData ? JSON.parse(bankData) : {},
      kycDocuments: docs,
      status: 'approved',
      isApproved: true,
      remark,
      customFields: customFields ? (typeof customFields === 'string' ? JSON.parse(customFields) : customFields) : {}
    });

    await newVendor.save();

    // Delete OTP record since it is verified (for non-owner roles)
    if (role !== 'owner') {
      const OTPVerification = require('../models/OTPVerification');
      await OTPVerification.deleteOne({ mobile });
    }

    res.status(201).json({ 
        message: 'Vendor registered and activated successfully!',
        vendorId: newVendor._id 
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

const jwt = require('jsonwebtoken');

exports.loginVendor = async (req, res) => {
    const { mobile } = req.body;
    try {
        const vendor = await Vendor.findOne({ mobile });
        if (!vendor) return res.status(404).json({ message: 'Vendor not registered with this mobile number' });

        // Check Status
        if (vendor.isBlocked) {
            return res.status(403).json({ 
                message: 'Your account has been blocked by the administrator. Please contact support.',
                status: 'blocked'
            });
        }

        if (vendor.status === 'pending') {
            return res.status(403).json({ 
                message: 'Your profile is pending for approval. Please wait for admin review.',
                status: 'pending'
            });
        }

        if (vendor.status === 'rejected') {
            return res.status(403).json({ 
                message: 'Your request has been rejected by the admin.',
                status: 'rejected'
            });
        }

        // Create token
        const token = jwt.sign({ id: vendor._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE,
        });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            vendor: {
                id: vendor._id,
                name: vendor.name,
                role: vendor.role,
                status: vendor.status,
                email: vendor.email,
                mobile: vendor.mobile,
                address: vendor.address,
                walletBalance: vendor.walletBalance || 0
            }
        });
    } catch (error) {
        console.error("Vendor Login Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getVendorProfile = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
        res.status(200).json(vendor);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

exports.updateVendorProfile = async (req, res) => {
    try {
        const { name, email, address, liveLocation } = req.body;
        const vendor = await Vendor.findByIdAndUpdate(
            req.params.id,
            { 
                name, 
                email, 
                address: typeof address === 'string' ? JSON.parse(address) : address,
                liveLocation: typeof liveLocation === 'string' ? JSON.parse(liveLocation) : liveLocation
            },
            { new: true }
        );
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
        res.status(200).json({ message: 'Profile updated successfully', vendor });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
};

exports.updateVendorKYC = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        const docs = { ...vendor.kycDocuments };
        if (req.files) {
            Object.keys(req.files).forEach(key => {
                docs[key] = req.files[key][0].path;
            });
        }

        vendor.kycDocuments = docs;
        await vendor.save();

        res.status(200).json({ message: 'Documents updated successfully', kycDocuments: docs });
    } catch (error) {
        res.status(500).json({ message: 'Error updating documents', error: error.message });
    }
};

exports.toggleStatus = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
        
        vendor.isOnline = !vendor.isOnline;
        await vendor.save();
        
        res.status(200).json({ 
            message: `Status updated to ${vendor.isOnline ? 'Online' : 'Offline'}`, 
            isOnline: vendor.isOnline 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating status' });
    }
};

exports.getVendors = async (req, res) => {
    try {
        const { role, state, district, vehicleClass, specialty, practiceArea, rtoService } = req.query;
        let query = { status: 'approved', isOnline: true }; // Only show approved and online vendors

        if (role) {
            // Map plural frontend categories to singular backend roles
            const roleMap = {
                'drivers': 'driver',
                'mechanics': 'mechanic',
                'towing': 'towing',
                'rto': 'rto',
                'legal': 'legal'
            };
            const mappedRole = roleMap[role.toLowerCase()];
            if (mappedRole) {
                query.role = mappedRole;
            }
        }
        
        if (state) {
            query['address.state'] = { $regex: new RegExp(state, 'i') };
        }
        if (district) {
            query['address.city'] = { $regex: new RegExp(district, 'i') };
        }
        if (vehicleClass) {
            query['professionalDetails.vehicleClasses'] = vehicleClass;
        }
        if (specialty) {
            query['mechanicDetails.specialties'] = specialty;
        }
        if (practiceArea) {
            query['legalDetails.practiceAreas'] = practiceArea;
        }
        if (rtoService) {
            query['rtoDetails.services'] = rtoService;
        }

        const vendors = await Vendor.find(query)
            .select('name mobile role profileImage rating totalReviews address status isOnline createdAt')
            .sort({ rating: -1, createdAt: -1 });

        // Privacy Masking Logic
        let maskedVendors = vendors;
        const authUser = req.user; // Requires protect middleware to be used in routes

        if (!authUser) {
            // Not logged in: Mask all
            maskedVendors = vendors.map(v => ({
                ...v._doc,
                mobile: v.mobile ? `${v.mobile.substring(0, 3)}XXXXX${v.mobile.substring(v.mobile.length - 2)}` : 'XXXXXXXXXX'
            }));
        } else {
            const user = await User.findById(authUser.id);
            const hasActivePlan = ['Daily', 'Monthly', 'Yearly'].includes(user.subscription?.plan) && user.subscription?.expiresAt > new Date();

            if (hasActivePlan) {
                // Member user: Full access
                maskedVendors = vendors;
            } else {
                // Non-member: Check individual unlocks from User model
                const unlockedVendorIds = user.unlockedVendors?.map(id => id.toString()) || [];

                maskedVendors = vendors.map(v => {
                    const isUnlocked = unlockedVendorIds.includes(v._id.toString());
                    return {
                        ...v._doc,
                        mobile: isUnlocked ? v.mobile : `${v.mobile.substring(0, 3)}XXXXX${v.mobile.substring(v.mobile.length - 2)}`,
                        isUnlocked
                    };
                });
            }
        }

        res.status(200).json({ success: true, vendors: maskedVendors });
    } catch (error) {
        console.error("Error fetching vendors:", error);
        res.status(500).json({ success: false, message: 'Error fetching vendors' });
    }
};

exports.deleteVendorAccount = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.user.id);
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        // Optionally delete KYC documents from Cloudinary here if needed
        // Since we are doing a hard delete:
        await Vendor.findByIdAndDelete(req.user.id);

        res.status(200).json({ success: true, message: 'Vendor account deleted successfully' });
    } catch (error) {
        console.error("Delete Vendor Error:", error);
        res.status(500).json({ success: false, message: 'Error deleting account' });
    }
};
