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
// import 'bootstrap/dist/css/bootstrap.min.css';
import CustomerDocComment from './components/CustomerDocComment'
import { useEffect } from 'react';


const App = () => {
  const userData = JSON.parse(localStorage.getItem("user"));
const token = userData?.token;


 //Check User has Permission
  const requestPermission = async () => {
    console.log('Requesting permission...');
    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        console.log('Notification permission granted.');
      } else {
        console.warn('Notification permission denied.');
      }

    } catch (error) {
      console.error('An error occurred while requesting permission or getting token:', error);
    }
  };
  //function lock
  useEffect(() => {
    requestPermission()
  }, [])
  useSessionTimeOut(token);
  return (
    <ThemeProvider>
        <Routes>
        <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
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
          <Route path="/edit-project/:projectId" element={<ProtectedRoute><EditProject/></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><Customer/></ProtectedRoute>} />
          <Route path="/add-customer" element={<ProtectedRoute><CustomerForm/></ProtectedRoute>} />
          <Route path="/project/:projectId/file-comments" element={<ProtectedRoute><FileCommentsPage /></ProtectedRoute>} />

          <Route path="/users/add" element={<UserForm />} />
          <Route path="/users/edit/:id" element={<UserForm />} />
          <Route path="/edit-customer/:id" element={<EditCustomer />} />
          <Route path="/view-customer/:id" element={<ViewCustomer />} />
          <Route path="/customerDoc/comment/:docName/:docId" element={<CustomerDocComment />} />

          <Route path="/requested_customer" element={<Requestform/>} />

        </Routes>
    </ThemeProvider>
  );
};

export default App;
