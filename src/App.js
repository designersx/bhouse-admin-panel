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
import useSessionTimeOut from './customHook/useSessionTimeOut';
const App = () => {
  const userData = JSON.parse(localStorage.getItem("user"));
const token = userData?.token;

console.log(token, "JWT Token");

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

          
        </Routes>
    </ThemeProvider>
  );
};

export default App;
