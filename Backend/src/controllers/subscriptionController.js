const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Order for Subscription or Single Unlock
// @route   POST /api/subscriptions/create-order
// @access  Private
exports.createSubscriptionOrder = async (req, res) => {
    try {
        const { planType, vendorId } = req.body; // planType: 'Daily', 'Monthly', 'Yearly', or 'Single'
        let amount = 0;

        if (planType === 'Daily') amount = 99;
        else if (planType === 'Monthly') amount = 999;
        else if (planType === 'Yearly') amount = 9999;
        else if (planType === 'Single') amount = 9;
        else return res.status(400).json({ success: false, message: "Invalid plan type" });
        
        const options = {
            amount: amount * 100, 
            currency: "INR",
            receipt: `receipt_sub_${Date.now()}`,
            notes: {
                userId: req.user._id.toString(),
                planType,
                vendorId: vendorId || ""
            }
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            order,
            amount
        });
    } catch (error) {
        console.error("Subscription Order Error:", error);
        res.status(500).json({ success: false, message: "Could not create order" });
    }
};

// @desc    Verify Subscription or Single Unlock Payment
// @route   POST /api/subscriptions/verify-payment
// @access  Private
exports.verifySubscriptionPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            planType,
            vendorId
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            const user = await User.findById(req.user._id);
            
            if (planType === 'Single' && vendorId) {
                // Unlock single vendor
                if (!user.unlockedVendors.includes(vendorId)) {
                    user.unlockedVendors.push(vendorId);
                }
            } else {
                // Update Membership
                const expiresAt = new Date();
                if (planType === 'Daily') expiresAt.setDate(expiresAt.getDate() + 1);
                else if (planType === 'Monthly') expiresAt.setDate(expiresAt.getDate() + 30);
                else if (planType === 'Yearly') expiresAt.setFullYear(expiresAt.getFullYear() + 1);

                user.subscription = {
                    plan: planType,
                    expiresAt: expiresAt
                };
            }

            await user.save();

            res.json({
                success: true,
                message: planType === 'Single' ? "Expert unlocked successfully" : "Membership upgraded successfully",
                subscription: user.subscription,
                unlockedVendors: user.unlockedVendors
            });
        } else {
            res.status(400).json({ success: false, message: "Invalid payment signature" });
        }
    } catch (error) {
        console.error("Subscription Verification Error:", error);
        res.status(500).json({ success: false, message: "Verification failed" });
    }
};
