const cron = require('node-cron');
const ServiceRequest = require('../models/ServiceRequest');
const Admin = require('../models/Admin');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');

const initCronJobs = () => {
    // TIME HANDLE: Run every 25 minutes
    cron.schedule('*/25 * * * *', async () => {
        console.log('--- Running Service Request Expiry Check (Every 25m) ---');
        try {
            // TIME HANDLE: Calculate 25 minutes ago
            const expiryThreshold = new Date(Date.now() - 25 * 60 * 1000);

            // Find pending requests older than 25 minutes
            const expiredRequests = await ServiceRequest.find({
                status: 'pending',
                createdAt: { $lt: expiryThreshold }
            }).populate('requesterId');

            if (expiredRequests.length === 0) {
                console.log('No expired requests found.');
                return;
            }

            console.log(`Found ${expiredRequests.length} expired requests. Processing...`);

            // Find an admin to receive the funds
            const admin = await Admin.findOne({ role: 'admin' });
            if (!admin) {
                console.error('No admin found to transfer funds!');
                return;
            }

            for (const request of expiredRequests) {
                // 1. Update status
                request.status = 'cancelled';
                await request.save();

                // 2. Add to Admin Wallet
                admin.walletBalance += 5;
                
                // 3. Record Transaction for Admin
                await WalletTransaction.create([{
                    userId: request.requesterType === 'User' ? request.requesterId : undefined,
                    vendorId: request.requesterType === 'Vendor' ? request.requesterId : undefined,
                    userType: request.requesterType.toLowerCase(),
                    amount: 5,
                    type: 'credit',
                    transactionType: 'payment',
                    status: 'success',
                    description: `Expired lead fee from request ${request._id}`
                }]);

                console.log(`Request ${request._id} expired. ₹5 credited to Admin.`);
            }

            await admin.save();
            console.log('--- Expiry Check Completed ---');

        } catch (error) {
            console.error('Cron Job Error:', error);
        }
    });

    // SUBSCRIPTION EXPIRE CHECK: Run every hour to catch short-term (Daily) plans
    cron.schedule('0 * * * *', async () => {
        console.log('--- Running Subscription Expiry Check (Hourly) ---');
        try {
            const now = new Date();
            const result = await User.updateMany(
                { 
                    'subscription.plan': { $in: ['Daily', 'Monthly', 'Yearly', 'Prime'] },
                    'subscription.expiresAt': { $lt: now } 
                },
                { 
                    $set: { 'subscription.plan': 'none' } 
                }
            );
            if (result.modifiedCount > 0) {
                console.log(`Checked subscriptions. ${result.modifiedCount} expired memberships reset.`);
            }
        } catch (error) {
            console.error('Subscription Cron Error:', error);
        }
    });
};

module.exports = initCronJobs;
