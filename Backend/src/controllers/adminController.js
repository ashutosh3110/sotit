const Vendor = require('../models/Vendor');
const User = require('../models/User');

exports.getPendingVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find({ status: 'pending' }).sort({ createdAt: -1 });
        res.status(200).json(vendors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending vendors' });
    }
};

exports.getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find({ status: 'approved' }).sort({ createdAt: -1 });
        res.status(200).json(vendors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vendors' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

exports.getMasterDirectory = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        const vendors = await Vendor.find({ status: 'approved' }).sort({ createdAt: -1 });
        
        // Add default role to users if not present
        const formattedUsers = users.map(u => ({ ...u._doc, role: u.role || 'customer' }));
        const formattedVendors = vendors.map(v => ({ ...v._doc }));

        const merged = [...formattedUsers, ...formattedVendors].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        res.status(200).json(merged);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching directory' });
    }
};

exports.updateVendorStatus = async (req, res) => {
    const { vendorId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const vendor = await Vendor.findByIdAndUpdate(
            vendorId, 
            { status, isApproved: status === 'approved' },
            { new: true }
        );

        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        // Create Notification
        const Notification = require('../models/Notification');
        await Notification.create({
            recipient: vendor._id,
            recipientModel: 'Vendor',
            title: `Account ${status === 'approved' ? 'Approved' : 'Updated'}`,
            message: status === 'approved' 
                ? "Your partner account has been verified. You can now start receiving leads."
                : `Your account status has been updated to ${status}.`,
            type: status === 'approved' ? 'success' : 'info'
        });

        res.status(200).json({ message: `Vendor ${status} successfully`, vendor });
    } catch (error) {
        res.status(500).json({ message: 'Error updating vendor status' });
    }
};
exports.toggleVendorBlock = async (req, res) => {
    const { vendorId } = req.params;
    try {
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        const updatedVendor = await Vendor.findByIdAndUpdate(
            vendorId,
            { isBlocked: !vendor.isBlocked },
            { new: true }
        );

        res.status(200).json({ 
            message: `Vendor ${updatedVendor.isBlocked ? 'blocked' : 'unblocked'} successfully`, 
            vendor: updatedVendor 
        });
    } catch (error) {
        console.error("Error toggling vendor block status:", error);
        res.status(500).json({ message: 'Error toggling block status' });
    }
};

exports.updateVendorRating = async (req, res) => {
    const { vendorId } = req.params;
    const { rating } = req.body;

    try {
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        // Security: Don't allow manual rating for drivers
        if (vendor.role === 'driver') {
            return res.status(400).json({ message: 'Driver ratings are automated and cannot be set manually.' });
        }

        const updatedVendor = await Vendor.findByIdAndUpdate(
            vendorId,
            { rating },
            { new: true }
        );

        res.status(200).json({ message: 'Rating updated successfully', vendor: updatedVendor });
    } catch (error) {
        console.error("Error updating rating:", error);
        res.status(500).json({ message: 'Error updating rating' });
    }
};

exports.toggleUserBlock = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { isBlocked: !user.isBlocked },
            { new: true }
        );

        res.status(200).json({
            message: `User ${updatedUser.isBlocked ? 'blocked' : 'unblocked'} successfully`,
            user: updatedUser
        });
    } catch (error) {
        console.error("Error toggling user block status:", error);
        res.status(500).json({ message: 'Error toggling block status' });
    }
};

exports.updateVendor = async (req, res) => {
    const { vendorId } = req.params;
    const updateData = req.body;

    try {
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        if (updateData.mobile && updateData.mobile !== vendor.mobile) {
            const existing = await Vendor.findOne({ mobile: updateData.mobile });
            if (existing) {
                return res.status(400).json({ message: 'Mobile number already registered by another vendor' });
            }
        }

        // Update core fields
        if (updateData.name !== undefined) vendor.name = updateData.name;
        if (updateData.mobile !== undefined) vendor.mobile = updateData.mobile;
        if (updateData.email !== undefined) vendor.email = updateData.email;
        if (updateData.role !== undefined) vendor.role = updateData.role;
        if (updateData.status !== undefined) {
            vendor.status = updateData.status;
            vendor.isApproved = updateData.status === 'approved';
        }
        if (updateData.isBlocked !== undefined) vendor.isBlocked = updateData.isBlocked;
        if (updateData.rating !== undefined) vendor.rating = updateData.rating;
        if (updateData.isOnline !== undefined) vendor.isOnline = updateData.isOnline;

        if (updateData.password) {
            vendor.password = updateData.password; // triggers pre-save hash
        }

        if (updateData.address) {
            vendor.address = {
                ...vendor.address,
                ...updateData.address
            };
        }

        if (updateData.bankDetails) {
            vendor.bankDetails = {
                ...vendor.bankDetails,
                ...updateData.bankDetails
            };
        }

        // Role specific details
        if (updateData.professionalDetails) {
            vendor.professionalDetails = {
                ...vendor.professionalDetails,
                ...updateData.professionalDetails
            };
        }
        if (updateData.mechanicDetails) {
            vendor.mechanicDetails = {
                ...vendor.mechanicDetails,
                ...updateData.mechanicDetails
            };
        }
        if (updateData.rtoDetails) {
            vendor.rtoDetails = {
                ...vendor.rtoDetails,
                ...updateData.rtoDetails
            };
        }
        if (updateData.legalDetails) {
            vendor.legalDetails = {
                ...vendor.legalDetails,
                ...updateData.legalDetails
            };
        }

        await vendor.save();

        res.status(200).json({ message: 'Vendor details updated successfully', vendor });
    } catch (error) {
        console.error("Error updating vendor:", error);
        res.status(500).json({ message: 'Error updating vendor details', error: error.message });
    }
};

