// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyCcyaivl2gBsyWRO_0P0iGBOOq0foD9lk0",
  authDomain: "ezoflife-b6ead.firebaseapp.com",
  projectId: "ezoflife-b6ead",
  storageBucket: "ezoflife-b6ead.firebasestorage.app",
  messagingSenderId: "640954477936",
  appId: "1:640954477936:web:fd97012a2a9bd96b5b33b5"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
