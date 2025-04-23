import { Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Settings from './pages/Settings';
import Users from './pages/Users';
import Profile from './pages/Profile';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Roles from './pages/Roles';
import CreateRole from './pages/CreateRole';
import EditRole from './pages/EditRole';
import useSessionTimeOut from './customHook/useSessionTimeOut';
import ForgotPassword from './pages/ForgetPassword';
import Projects from './pages/Projects/Projects';
import AddProject from './pages/Projects/AddProject';
import ArchivedProjects from './pages/Projects/ArchivedProjects';
import ProjectDetails from './pages/Projects/ProjectDetails';
import EditProject from './pages/Projects/EditProject';
import Customer from './pages/Customer/Customer';
import CustomerForm from './pages/Customer/CustomerForm';
import UserForm from './pages/userForm';
import EditCustomer from './components/EditCustomer';
import ViewCustomer from './pages/Customer/ViewCustomer';
import FileCommentsPage from './pages/Projects/FileCommentPage';
import Requestform from './pages/RequestForm/Requestform';
import CustomerDocComment from './components/CustomerDocComment'
import { useEffect } from 'react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, onMessage } from "firebase/messaging";
// Initialize Firebase App
const firebaseConfig = {
  apiKey: "AIzaSyDblY3fqpz8K5KXDA3HacPUzHxBnZHT1o0",
  authDomain: "bhouse-dc970.firebaseapp.com",
  projectId: "bhouse-dc970",
  storageBucket: "bhouse-dc970.appspot.com",
  messagingSenderId: "577116029205",
  appId: "1:577116029205:web:659adeb7405b59ad21691c",
  measurementId: "G-RFFMNTE7XQ"
};
const App = () => {
  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.token;
  // Initialize App
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  const messaging = getMessaging(app);
  // Check User has Permission
  onMessage(messaging, (payload) => {
      const title = payload.data.title || 'New Notification';
      const body = payload.data.body || 'You have a new message';
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/Svg/b-houseLogo.svg',
        });
      }
    });
  // const requestPermission = async () => {
  //   if (!isNewNotificationSupported()) {
  //     console.warn('Notifications are not supported in this browser.');
  //     return;
  //   }

  //   console.log('Requesting permission...');
  //   try {
  //     const permission = await Notification.requestPermission();
  //     if (permission === 'granted') {
  //       console.log('Notification permission granted.');
  //     } else {
  //       console.warn('Notification permission denied.');
  //     }
  //   } catch (error) {
  //     console.error('An error occurred while requesting permission:', error);
  //   }
  // };
  // function isNewNotificationSupported() {
  //   if (!window.Notification || !Notification.requestPermission)
  //     return false;
  //   if (Notification.permission === 'granted')
  //     throw new Error('You must only call this *before* calling Notification.requestPermission(), otherwise this feature detect would bug the user with an actual notification!');
  //   try {
  //     new Notification('');
  //   } catch (e) {
  //     if (e.name === 'TypeError') return false;
  //   }
  //   return true;
  // }
  //function lock
  // useEffect(() => {
  //   requestPermission();
  //   // Foreground notification listener
  //   onMessage(messaging, (payload) => {
  //     const notificationTitle = payload.data.title || 'B-House Notification';
  //     const notificationBody = payload.data.body || 'You have a new message';
  //     const clickActionURL = payload.data.click_action || 'https://your-default-url.com/';

  //     // Create a simple notification without actions
  //     if (Notification.permission === 'granted') {
  //       new Notification(notificationTitle, {
  //         body: notificationBody,
  //         icon: '/Svg/b-houseLogo.svg'
  //       });
  //     }
  //   });

  //   // Register the service worker
  //   if ('serviceWorker' in navigator) {
  //     navigator.serviceWorker.register('/firebase-messaging-sw.js')
  //       .then((registration) => {
  //         console.log('Service Worker registered with scope:', registration.scope);
  //       })
  //       .catch((error) => {
  //         console.error('Service Worker registration failed:', error);
  //       });
  //   }
  // }, [messaging]);

  useSessionTimeOut(token);
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/roles" element={<ProtectedRoute><Roles /></ProtectedRoute>} />
        <Route path="/create-role" element={<ProtectedRoute><CreateRole /></ProtectedRoute>} />
        <Route path="/edit-role/:id" element={<ProtectedRoute><EditRole /></ProtectedRoute>} />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
        <Route path="/add-projects" element={<ProtectedRoute><AddProject /></ProtectedRoute>} />
        <Route path="/archived-projects" element={<ProtectedRoute><ArchivedProjects /></ProtectedRoute>} />
        <Route path="/project-details/:projectId" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
        <Route path="/edit-project/:projectId" element={<ProtectedRoute><EditProject /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><Customer /></ProtectedRoute>} />
        <Route path="/add-customer" element={<ProtectedRoute><CustomerForm /></ProtectedRoute>} />
        <Route path="/project/:projectId/file-comments" element={<ProtectedRoute><FileCommentsPage /></ProtectedRoute>} />

        <Route path="/users/add" element={<UserForm />} />
        <Route path="/users/edit/:id" element={<UserForm />} />
        <Route path="/edit-customer/:id" element={<EditCustomer />} />
        <Route path="/view-customer/:id" element={<ViewCustomer />} />
        <Route path="/customerDoc/comment/:docName/:docId" element={<CustomerDocComment />} />

        <Route path="/requested_customer" element={<Requestform />} />

      </Routes>
    </ThemeProvider>
  );
};
export default App;
