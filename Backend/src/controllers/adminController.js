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

        vendor.isBlocked = !vendor.isBlocked;
        await vendor.save();

        res.status(200).json({ 
            message: `Vendor ${vendor.isBlocked ? 'blocked' : 'unblocked'} successfully`, 
            vendor 
        });
    } catch (error) {
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

        vendor.rating = rating;
        await vendor.save();

        res.status(200).json({ message: 'Rating updated successfully', vendor });
    } catch (error) {
        res.status(500).json({ message: 'Error updating rating' });
    }
};
