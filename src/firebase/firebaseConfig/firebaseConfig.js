
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
const firebaseConfig = {
  apiKey: "AIzaSyDblY3fqpz8K5KXDA3HacPUzHxBnZHT1o0",
  authDomain: "bhouse-dc970.firebaseapp.com",
  projectId: "bhouse-dc970",
  storageBucket: "bhouse-dc970.firebasestorage.app",
  messagingSenderId: "577116029205",
  appId: "1:577116029205:web:659adeb7405b59ad21691c",
  measurementId: "G-RFFMNTE7XQ"
};

// Initialize Firebase
export const  app = initializeApp(firebaseConfig);
// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging = getMessaging(app);