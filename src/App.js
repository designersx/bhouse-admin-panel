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



const App = () => {
  const userData = JSON.parse(localStorage.getItem("user"));
const token = userData?.token;



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

          <Route path="/users/add" element={<UserForm />} />
          <Route path="/users/edit/:id" element={<UserForm />} />
          <Route path="/edit-customer/:id" element={<EditCustomer />} />

        </Routes>
    </ThemeProvider>
  );
};

export default App;
