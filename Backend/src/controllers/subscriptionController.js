const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Subscription Order
// @route   POST /api/subscriptions/create-order
// @access  Private
exports.createSubscriptionOrder = async (req, res) => {
    try {
        const amount = 99; // Fixed amount for Prime
        
        const options = {
            amount: amount * 100, 
            currency: "INR",
            receipt: `receipt_sub_${Date.now()}`,
            notes: {
                userId: req.user._id.toString(),
                plan: 'Prime'
            }
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error("Subscription Order Error:", error);
        res.status(500).json({ success: false, message: "Could not create subscription order" });
    }
};

// @desc    Verify Subscription Payment
// @route   POST /api/subscriptions/verify-payment
// @access  Private
exports.verifySubscriptionPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature 
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Update User Subscription
            const user = await User.findById(req.user._id);
            
            // Set expiry to 30 days from now
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            user.subscription = {
                plan: 'Prime',
                expiresAt: expiresAt
            };

            await user.save();

            res.json({
                success: true,
                message: "Membership upgraded to Prime successfully",
                subscription: user.subscription
            });
        } else {
            res.status(400).json({ success: false, message: "Invalid payment signature" });
        }
    } catch (error) {
        console.error("Subscription Verification Error:", error);
        res.status(500).json({ success: false, message: "Verification failed" });
    }
};
