const Razorpay = require('razorpay');
const crypto = require('crypto');
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const WalletTransaction = require('../models/WalletTransaction');
const SystemSetting = require('../models/SystemSetting');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay Order for Hiring Expert
// @route   POST /api/services/create-payment
// @access  Private
exports.createHireOrder = async (req, res) => {
    try {
        const { vendorId, role } = req.body;
        let settings = await SystemSetting.findOne();
        if (!settings) {
            settings = await SystemSetting.create({});
        }
        const amount = settings.hireExpertFee; // dynamic hire expert fee

        const options = {
            amount: amount * 100, // in paisa
            currency: "INR",
            receipt: `hire_receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            order,
            amount
        });
    } catch (error) {
        console.error("Create Hire Order Error:", error);
        res.status(500).json({ success: false, message: "Could not initiate payment" });
    }
};

// @desc    Verify Payment and Finalize Hire
// @route   POST /api/services/verify-hire-payment
// @access  Private
exports.verifyHirePayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            vendorId,
            role,
            details
        } = req.body;

        let settings = await SystemSetting.findOne();
        if (!settings) {
            settings = await SystemSetting.create({});
        }
        const amount = settings.hireExpertFee;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return res.status(400).json({ success: false, message: "Payment verification failed" });
        }

        // 1. Create Service Request
        const actorId = req.user.id;
        const user = await User.findById(actorId);
        const requesterVendor = await Vendor.findById(actorId);
        const requester = user || requesterVendor;
        const requesterType = user ? 'User' : 'Vendor';

        const isDirectHire = !!vendorId;
        const request = await ServiceRequest.create({
            requesterId: actorId,
            requesterType: requesterType,
            vendor: vendorId || undefined,
            role: role.toLowerCase(),
            details: details || {},
            status: (isDirectHire && role.toLowerCase() === 'driver') ? 'hired' : (isDirectHire ? 'accepted' : 'pending'),
            hiredAt: (isDirectHire && role.toLowerCase() === 'driver') ? new Date() : undefined,
            customerDeduction: amount, // Record the payment amount
            paymentId: razorpay_payment_id,
            paymentStatus: 'success'
        });

        // 2. Create Transaction Record for Admin reference
        await WalletTransaction.create({
            userId: user ? actorId : undefined,
            vendorId: requesterVendor ? actorId : undefined,
            userType: user ? 'user' : 'vendor',
            amount: amount,
            type: 'debit',
            transactionType: 'payment',
            status: 'success',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            description: `Hiring ${role} Expert: ${vendorId || 'Broadcast'}`
        });

        // 3. Socket/Notification Logic
        const io = req.app.get('io');
        if (vendorId) {
            const targetVendor = await Vendor.findById(vendorId);
            if (io) {
                io.to(vendorId.toString()).emit('new_lead', {
                    requestId: request._id,
                    requesterName: requester.name,
                    role: role,
                    message: 'You have a new direct hiring request!'
                });
            }

        } else {
            if (io) {
                io.to(`role_${role.toLowerCase()}`).emit('new_lead', {
                    requestId: request._id,
                    requesterName: requester.name,
                    role: role,
                    message: `New ${role} lead available!`
                });
            }
        }

        res.json({
            success: true,
            message: "Expert hired successfully!",
            requestId: request._id
        });

    } catch (error) {
        console.error("Verify Hire Payment Error:", error);
        res.status(500).json({ success: false, message: "Verification failed" });
    }
};

// @desc    Create Razorpay Order for Vendor to Accept Lead
// @route   POST /api/services/create-acceptance-payment
// @access  Private (Vendor)
exports.createAcceptanceOrder = async (req, res) => {
    try {
        const { requestId } = req.body;
        let settings = await SystemSetting.findOne();
        if (!settings) {
            settings = await SystemSetting.create({});
        }
        const amount = settings.leadAcceptanceFee; // Fix amount for accepting lead

        const options = {
            amount: amount * 100, // in paisa
            currency: "INR",
            receipt: `accept_receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            order,
            amount
        });
    } catch (error) {
        console.error("Create Acceptance Order Error:", error);
        res.status(500).json({ success: false, message: "Could not initiate payment" });
    }
};

// @desc    Verify Payment and Finalize Lead Acceptance
// @route   POST /api/services/verify-acceptance-payment
// @access  Private (Vendor)
exports.verifyAcceptancePayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            requestId
        } = req.body;

        let settings = await SystemSetting.findOne();
        if (!settings) {
            settings = await SystemSetting.create({});
        }
        const amount = settings.leadAcceptanceFee;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return res.status(400).json({ success: false, message: "Payment verification failed" });
        }

        // 1. Update Service Request Status
        const vendorId = req.user.id;
        const request = await ServiceRequest.findById(requestId).populate('requesterId');

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        // Allow payment if it is pending, or if it is a direct request assigned to this vendor and not paid yet
        const isAssignedDirectRequest = request.vendor && request.vendor.toString() === vendorId.toString();
        const canPay = request.status === 'pending' || (isAssignedDirectRequest && !request.isVendorPaid);

        if (!canPay) {
            return res.status(400).json({ success: false, message: "Request is no longer available or already unlocked" });
        }

        const vendor = await Vendor.findById(vendorId);

        if (request.status === 'pending') {
            request.status = request.role === 'driver' ? 'hired' : 'accepted';
            request.hiredAt = request.role === 'driver' ? new Date() : undefined;
            request.vendor = vendorId;
        }

        request.vendorDeduction = amount; // Record the payment amount
        request.isVendorPaid = true;
        await request.save();

        // 2. Create Transaction Record
        await WalletTransaction.create({
            vendorId: vendorId,
            userType: 'vendor',
            amount: amount,
            type: 'debit',
            transactionType: 'payment',
            status: 'success',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            description: `Lead Acceptance Fee for Request: ${requestId}`
        });



        res.json({
            success: true,
            message: "Lead accepted successfully!",
            request
        });

    } catch (error) {
        console.error("Verify Acceptance Payment Error:", error);
        res.status(500).json({ success: false, message: "Verification failed" });
    }
};

exports.createSubscriptionOrder = async (req, res) => {
    try {
        const amount = 99; 
        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `sub_receipt_${Date.now()}`,
        };
        const order = await razorpay.orders.create(options);
        res.json({ success: true, order, amount });
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not initiate subscription" });
    }
};

exports.verifySubscriptionPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Payment verification failed" });
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { subscription: { plan: 'Prime', expiresAt: expiresAt } },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        await WalletTransaction.create({
            userId: req.user.id,
            userType: 'user',
            amount: 99,
            type: 'debit',
            transactionType: 'payment',
            status: 'success',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            description: `Prime Subscription Purchased`
        });

        res.json({ success: true, message: "Subscription activated!", subscription: user.subscription });
    } catch (error) {
        res.status(500).json({ success: false, message: "Verification failed" });
    }
};
