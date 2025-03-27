import { FiHome, FiUsers, FiSettings, FiUser } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import '../styles/components.css';
import { CiLogout } from "react-icons/ci";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AiFillProject } from 'react-icons/ai';
import { FaUserCircle } from "react-icons/fa";
import { useSidebarPermissions } from '../context/RolePermissionsContext';
const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation();

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        navigate('/');
      }
    });
  };
  const user = JSON.parse(localStorage.getItem('user'));
  const roleId = user?.user?.roleId;
  const { rolePermissions, loading } = useSidebarPermissions();

  if (loading) return null; 

  const hasUserPermissions = rolePermissions?.UserManagement?.create ||
    rolePermissions?.UserManagement?.edit ||
    rolePermissions?.UserManagement?.delete ||
    rolePermissions?.UserManagement?.view;

  const roles = rolePermissions?.Roles?.create ||
  rolePermissions?.Roles?.edit||
  rolePermissions?.Roles?.delete ||
  rolePermissions?.Roles?.view;

  //27/03/2025
  // const role = user?.user?.userRolef

  // const customer = rolePermissions?.Customer?.create ||
  //   rolePermissions?.UserManagement?.edit ||
  //   rolePermissions?.UserManagement?.delete ||
  //   rolePermissions?.UserManagement?.view;


  return (
    <div className="sidebar">
      <div className="logo">Hi, {user?.user?.firstName}</div>
      <ul>
        <li className={location.pathname === '/dashboard' ? 'active' : ''}>
          <Link to="/dashboard"><FiHome /> Dashboard</Link>
        </li>
        {hasUserPermissions && (
          <li className={location.pathname === '/users' ? 'active' : ''}>
            <Link to="/users"><FiUsers /> Users</Link>
          </li>
        )}
        <li className={location.pathname === '/profile' ? 'active' : ''}>
          <Link to="/profile"><FiUser /> Profile</Link>
        </li>
        {roles && (
          <li className={location.pathname === '/roles' ? 'active' : ''}>
            <Link to="/roles"><FiUser /> Roles</Link>
          </li>
        )}
        <li className={location.pathname === '/projects' ? 'active' : ''}>
          <Link to="/projects"><AiFillProject /> Projects</Link>
        </li>
          <li className={location.pathname === '/customers' ? 'active' : ''}>
            <Link to="/customers"><FaUserCircle /> Customers</Link>
          </li>
        <li className={location.pathname === '/settings' ? 'active' : ''}>
          <Link to="/settings"><FiSettings /> Settings</Link>
        </li>
        <li onClick={handleLogout} >
          <Link > <CiLogout /> Logout</Link>

        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
