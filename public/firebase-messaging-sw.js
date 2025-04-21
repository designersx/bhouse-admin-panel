
// public/firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyDblY3fqpz8K5KXDA3HacPUzHxBnZHT1o0",
  authDomain: "bhouse-dc970.firebaseapp.com",
  projectId: "bhouse-dc970",
  storageBucket: "bhouse-dc970.firebasestorage.app",
  messagingSenderId: "577116029205",
  appId: "1:577116029205:web:659adeb7405b59ad21691c",
  measurementId: "G-RFFMNTE7XQ"
};
// ✅ Initialize Firebase
firebase.initializeApp(firebaseConfig);
// ✅ Get messaging instance
const messaging = firebase.messaging();

// messaging.onBackgroundMessage(function(payload) {
//   const notificationTitle = payload.notification.title;
//   const notificationOptions = {
//     body: payload.notification.body,
//     icon: '/Svg/b-houseLogo.svg'
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });
let shownNotifications = new Set(); // Keeps track of shown notifications

messaging.onBackgroundMessage(function(payload) {
  const notifId = payload?.data?.id || payload?.notification?.title;

  // If the notification was already shown, do not show it again
  if (shownNotifications.has(notifId)) {
    console.log('Notification already shown:', notifId);
    return;
  }

  shownNotifications.add(notifId); // Mark this notification as shown

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/Svg/b-houseLogo.svg',
    tag: notifId,       // ✅ Make tag same as notifId
    renotify: true,     // Allows replacement if same tag used
    data: {
      click_action: payload?.data?.click_action || "/"
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
