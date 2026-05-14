const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Admin = require('../models/Admin');
const WalletTransaction = require('../models/WalletTransaction');
const { sendPushNotification } = require('../utils/firebase');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay Order
// @route   POST /api/wallet/create-order
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        const isVendor = !!req.vendor;
        const actorId = isVendor ? req.vendor._id : req.user._id;
        
        const options = {
            amount: amount * 100, 
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        // Create a pending transaction
        await WalletTransaction.create({
            userId: isVendor ? undefined : actorId,
            vendorId: isVendor ? actorId : undefined,
            userType: isVendor ? 'vendor' : 'user',
            amount,
            type: 'credit',
            transactionType: 'recharge',
            status: 'pending',
            razorpayOrderId: order.id,
            description: isVendor ? 'Vendor Wallet Recharge' : 'User Wallet Recharge'
        });

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        res.status(500).json({ success: false, message: "Could not create order" });
    }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/wallet/verify-payment
// @access  Private
exports.verifyPayment = async (req, res) => {
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
            // Update Transaction
            const transaction = await WalletTransaction.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                { 
                    status: 'success', 
                    razorpayPaymentId: razorpay_payment_id 
                },
                { new: true }
            );

            // Update Balance based on userType
            if (transaction.userType === 'vendor') {
                const vendor = await Vendor.findById(transaction.vendorId);
                vendor.walletBalance = (vendor.walletBalance || 0) + transaction.amount;
                await vendor.save();

                // Send Notification to Admin
                try {
                    const admins = await Admin.find({ fcmToken: { $ne: null } });
                    const adminTokens = admins.map(a => a.fcmToken);
                    if (adminTokens.length > 0) {
                        const notificationPromises = adminTokens.map(token => 
                            sendPushNotification(
                                token,
                                "Vendor Wallet Recharge! 🛠️",
                                `Expert ${vendor.name} added ₹${transaction.amount} to their wallet.`,
                                { type: 'vendor_recharge', vendorId: vendor._id.toString() }
                            )
                        );
                        await Promise.allSettled(notificationPromises);
                    }
                } catch (err) {
                    console.error("Admin Notification Error (Vendor):", err);
                }
                
                res.json({
                    success: true,
                    message: "Vendor Payment verified successfully",
                    balance: vendor.walletBalance
                });
            } else {
                const user = await User.findById(transaction.userId);
                user.walletBalance = (user.walletBalance || 0) + transaction.amount;
                await user.save();

                // Send Notification to Admin
                try {
                    const admins = await Admin.find({ fcmToken: { $ne: null } });
                    const adminTokens = admins.map(a => a.fcmToken);
                    if (adminTokens.length > 0) {
                        const notificationPromises = adminTokens.map(token => 
                            sendPushNotification(
                                token,
                                "New Wallet Recharge! 💰",
                                `${user.name} added ₹${transaction.amount} to their wallet.`,
                                { type: 'wallet_recharge', userId: user._id.toString() }
                            )
                        );
                        await Promise.allSettled(notificationPromises);
                    }
                } catch (err) {
                    console.error("Admin Notification Error:", err);
                }

                res.json({
                    success: true,
                    message: "Payment verified successfully",
                    balance: user.walletBalance
                });
            }
        } else {
            res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (error) {
        console.error("Payment Verification Error:", error);
        res.status(500).json({ success: false, message: "Verification failed" });
    }
};

// @desc    Get Wallet Transactions
// @route   GET /api/wallet/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
    try {
        const isVendor = !!req.vendor;
        const actorId = isVendor ? req.vendor._id : req.user._id;

        const transactions = await WalletTransaction.find({ 
            [isVendor ? 'vendorId' : 'userId']: actorId 
        }).sort({ createdAt: -1 });

        const actor = isVendor 
            ? await Vendor.findById(actorId) 
            : await User.findById(actorId);

        // Sync Balance logic
        const successfulTransactions = await WalletTransaction.find({ 
            [isVendor ? 'vendorId' : 'userId']: actorId, 
            status: 'success' 
        });

        let calculatedBalance = 0;
        successfulTransactions.forEach(tx => {
            if (tx.type === 'credit') calculatedBalance += tx.amount;
            else calculatedBalance -= tx.amount;
        });

        if (actor.walletBalance !== calculatedBalance) {
            actor.walletBalance = calculatedBalance;
            await actor.save();
        }

        res.json({
            success: true,
            balance: actor.walletBalance,
            transactions
        });
    } catch (error) {
        console.error("Fetch Wallet Error:", error);
        res.status(500).json({ success: false, message: "Could not fetch transactions" });
    }
};
// @desc    Get All Wallet Data for Admin
// @route   GET /api/wallet/admin/data
// @access  Private/Admin
exports.getAdminWalletData = async (req, res) => {
    try {
        const users = await User.find({}, 'name mobile walletBalance createdAt status').sort({ createdAt: -1 });
        const vendors = await Vendor.find({}, 'name mobile walletBalance status role profile').sort({ createdAt: -1 });
        const transactions = await WalletTransaction.find({})
            .populate('userId', 'name')
            .populate('vendorId', 'name')
            .sort({ createdAt: -1 })
            .limit(100);

        // Calculate Stats
        const totalUserBalance = users.reduce((acc, user) => acc + (user.walletBalance || 0), 0);
        const totalVendorBalance = vendors.reduce((acc, vendor) => acc + (vendor.walletBalance || 0), 0);
        
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const todayRecharges = await WalletTransaction.find({
            createdAt: { $gte: today },
            status: 'success',
            transactionType: 'recharge'
        });

        const todayRechargeTotal = todayRecharges.reduce((acc, tx) => acc + tx.amount, 0);

        res.json({
            success: true,
            stats: {
                totalLiquidity: totalUserBalance + totalVendorBalance,
                totalUserBalance,
                totalVendorBalance,
                todayRechargeTotal,
                systemRevenue: 0 // Will implement with actual commission logic later
            },
            users,
            vendors,
            transactions: transactions.map(tx => ({
                id: tx._id,
                actor: tx.userId?.name || tx.vendorId?.name || 'System',
                type: tx.transactionType,
                amount: tx.type === 'credit' ? tx.amount : -tx.amount,
                date: tx.createdAt,
                status: tx.status,
                userType: tx.userType
            }))
        });
    } catch (error) {
        console.error("Admin Wallet Data Error:", error);
        res.status(500).json({ success: false, message: "Could not fetch admin wallet data" });
    }
};
