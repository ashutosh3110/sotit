const admin = require('firebase-admin');

try {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
    });
    console.log('[FIREBASE] Admin SDK Initialized Successfully');
} catch (error) {
    console.error('[FIREBASE] Admin SDK Initialization Failed:', error);
}

const sendPushNotification = async (token, title, body, data = {}) => {
    if (!token) return;
    
    const message = {
        notification: { title, body },
        data: {
            ...data,
            click_action: 'FLUTTER_NOTIFICATION_CLICK', // For mobile apps if needed
        },
        token: token,
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('[FIREBASE] Notification sent successfully:', response);
        return response;
    } catch (error) {
        console.error('[FIREBASE] Error sending notification:', error);
        throw error;
    }
};

module.exports = { admin, sendPushNotification };
