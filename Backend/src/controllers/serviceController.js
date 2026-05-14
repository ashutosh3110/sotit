const mongoose = require('mongoose');
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const WalletTransaction = require('../models/WalletTransaction');
const { sendPushNotification } = require('../utils/firebase');

// Hires an expert (Supports Direct Hiring and Network Broadcast)
// NOW FREE FOR EVERYONE
exports.hireExpert = async (req, res) => {
    try {
        const { vendorId, role, details } = req.body;
        const actorId = req.user.id;
        
        const user = await User.findById(actorId);
        const requesterVendor = await Vendor.findById(actorId);
        
        const requester = user || requesterVendor;
        const requesterType = user ? 'User' : 'Vendor';

        if (!requester) {
            return res.status(404).json({ message: 'Requester not found.' });
        }

        // Target Vendor (Expert being hired specifically, if any)
        let targetVendor = null;
        if (vendorId) {
            targetVendor = await Vendor.findById(vendorId);
        }

        // Create Service Request (No wallet deductions)
        const request = await ServiceRequest.create({
            requesterId: actorId,
            requesterType: requesterType,
            vendor: vendorId || undefined,
            role: role.toLowerCase(),
            details: details || {},
            status: role.toLowerCase() === 'driver' ? 'hired' : 'pending',
            hiredAt: role.toLowerCase() === 'driver' ? new Date() : undefined,
            customerDeduction: 0
        });

        // Emit Socket Event and FCM
        const io = req.app.get('io');
        if (targetVendor) {
            if (io) {
                io.to(vendorId.toString()).emit('new_lead', {
                    requestId: request._id,
                    requesterName: requester.name,
                    role: role,
                    message: 'You have a new direct hiring request!'
                });
            }
            if (targetVendor.fcmToken) {
                sendPushNotification(targetVendor.fcmToken, "New Direct Lead! 🔔", `${requester.name} hired you specifically.`, { requestId: request._id.toString(), type: 'new_lead' }).catch(e => {});
            }
        } else {
            if (io) {
                io.to(`role_${role.toLowerCase()}`).emit('new_lead', {
                    requestId: request._id,
                    requesterName: requester.name,
                    role: role,
                    message: `New ${role} lead available in the network!`
                });
            }
        }

        res.status(201).json({ 
            success: true, 
            message: 'Request sent successfully.',
            requestId: request._id
        });

    } catch (error) {
        console.error("Hire Expert Error:", error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

// Vendor accepts the request (NOW FREE)
exports.acceptRequest = async (req, res) => {
    try {
        const { requestId } = req.body;
        const vendorId = req.user.id;

        const request = await ServiceRequest.findById(requestId).populate('requesterId');
        if (!request || request.status !== 'pending') {
            return res.status(404).json({ message: 'Request no longer available' });
        }

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        // Update Request Status and Assign Vendor
        request.status = request.role === 'driver' ? 'hired' : 'accepted';
        request.hiredAt = request.role === 'driver' ? new Date() : undefined;
        request.vendor = vendorId; 
        await request.save();

        // Send FCM Push Notification to Requester
        if (request.requesterId && request.requesterId.fcmToken) {
            sendPushNotification(
                request.requesterId.fcmToken,
                "Expert Found! 🚗",
                `${vendor.name} has accepted your request.`,
                { requestId: requestId.toString(), type: 'request_accepted' }
            ).catch(e => {});
        }

        res.status(200).json({ success: true, message: 'Lead accepted!', request });

    } catch (error) {
        console.error("Accept Request Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get Vendor's eligible requests
exports.getVendorRequests = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const vendor = await Vendor.findById(vendorId);
        
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        const requests = await ServiceRequest.find({ 
            status: 'pending',
            $or: [
                { vendor: vendorId },
                { 
                    vendor: { $exists: false }, 
                    role: vendor.role.toLowerCase(),
                    requesterId: { $ne: vendorId } 
                }
            ]
        }).populate('requesterId', 'name mobile profilePicture');

        res.status(200).json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requests' });
    }
};

exports.getVendorHistory = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const history = await ServiceRequest.find({ 
            vendor: vendorId,
            status: { $ne: 'pending' } 
        })
        .populate('requesterId', 'name mobile profilePicture')
        .sort({ createdAt: -1 });
        res.status(200).json({ success: true, history });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching history' });
    }
};

exports.getUserHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const history = await ServiceRequest.find({ requesterId: userId })
            .populate('vendor', 'name profileImage role mobile')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, history });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching history' });
    }
};

exports.updateFCMToken = async (req, res) => {
    try {
        const { fcmToken, platform } = req.body;
        const userId = req.user.id;
        await User.findByIdAndUpdate(userId, { fcmToken, platform });
        await Vendor.findByIdAndUpdate(userId, { fcmToken, platform });
        res.status(200).json({ success: true, message: 'FCM Token registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating FCM token' });
    }
};

exports.sendTestNotification = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId) || await Vendor.findById(userId);
        
        if (!user || !user.fcmToken) {
            return res.status(404).json({ success: false, message: 'User or FCM Token not found. Please register FCM token first.' });
        }

        await sendPushNotification(
            user.fcmToken,
            "Test Success! 🚀",
            "Sootit notifications are working perfectly.",
            { type: 'test' }
        );

        res.status(200).json({ success: true, message: 'Test notification sent! Check your device.' });
    } catch (error) {
        console.error("Test Notification Error:", error);
        res.status(500).json({ success: false, message: 'Error sending test notification' });
    }
};
exports.checkDriverRatings = async (req, res) => {
    try {
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

        const requests = await ServiceRequest.find({
            role: 'driver',
            status: 'hired',
            ratingRequested: false,
            hiredAt: { $lte: oneMonthAgo }
        }).populate('requesterId').populate('vendor');

        for (const reqObj of requests) {
            // 1. Notify Customer
            if (reqObj.requesterId && reqObj.requesterId.fcmToken) {
                sendPushNotification(
                    reqObj.requesterId.fcmToken,
                    "How was your Driver? ⭐",
                    `It's been a month since you hired ${reqObj.vendor?.name}. Please share your experience!`,
                    { requestId: reqObj._id.toString(), type: 'rate_driver', vendorId: reqObj.vendor?._id?.toString() }
                ).catch(e => {});
            }

            // 2. Mark as requested
            reqObj.ratingRequested = true;
            await reqObj.save();
        }

        res.status(200).json({ success: true, processed: requests.length });
    } catch (error) {
        console.error("Check Driver Ratings Error:", error);
        res.status(500).json({ message: 'Error processing ratings' });
    }
};

exports.submitVendorRating = async (req, res) => {
    try {
        const { vendorId, rating, review, requestId } = req.body;
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        // Calculate New Average Rating
        const currentRating = vendor.rating || 0;
        const currentTotal = vendor.totalReviews || 0;
        const newTotal = currentTotal + 1;
        const newRating = ((currentRating * currentTotal) + rating) / newTotal;

        vendor.rating = Number(newRating.toFixed(1));
        vendor.totalReviews = newTotal;
        await vendor.save();

        if (requestId) {
            await ServiceRequest.findByIdAndUpdate(requestId, { status: 'completed' });
        }

        res.status(200).json({ success: true, message: 'Thank you for your feedback!', rating: vendor.rating });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting rating' });
    }
};

exports.getProfileData = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            const vendor = await Vendor.findById(req.user.id);
            return res.status(200).json({ success: true, user: vendor });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile' });
    }
};
