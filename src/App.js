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
import { getMessaging, onMessage , isSupported} from "firebase/messaging";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  // Notification setup
  useEffect(() => {
    isSupported().then((supported) => {
      if (supported) {
        const messaging = getMessaging(app);
        onMessage(messaging, (payload) => {
          console.log(payload)
          const { title, body } = payload?.data || {};
          toast.info(
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src="https://b-house-v0-ten.vercel.app/Svg/Logo-Bhouse.svg"
                alt="B-House"
                style={{ width: 60, height: 60, marginRight: 10, borderRadius: 8 }}
              />
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#333' }}>{title}</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>{body}</div>
              </div>
            </div>,
            {
              position: "bottom-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              style: {
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '10px',
                padding: '10px 15px',
                border: '1px solid #004680',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
              }
            }
          );
        });
      } else {
        console.warn("Firebase Messaging not supported on this device.");
      }
    }).catch((err) => {
      console.error("Error checking messaging support:", err);
    });
  }, []);

  useSessionTimeOut(token);
  return (
    <>
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
 <ToastContainer position="bottom-right" autoClose={5000} />
    </>
  );
};
export default App;
