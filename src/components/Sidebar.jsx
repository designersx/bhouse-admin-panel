import { FiHome, FiUsers, FiSettings, FiUser } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import '../styles/components.css';
import { CiLogout } from "react-icons/ci";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
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

  let user = JSON.parse(localStorage.getItem('user'))
  console.log({user})
  return (
    <div className="sidebar">
      <div className="logo">Hi, {user?.user?.firstName}</div>
      <ul>
        <li className={location.pathname === '/dashboard' ? 'active' : ''}>
          <Link to="/dashboard"><FiHome /> Dashboard</Link>
        </li>
        <li className={location.pathname === '/users' ? 'active' : ''}>
          <Link to="/users"><FiUsers /> Users</Link>
        </li>
        <li className={location.pathname === '/profile' ? 'active' : ''}>
          <Link to="/profile"><FiUser /> Profile</Link>
        </li>
        <li className={location.pathname === '/roles' ? 'active' : ''}>
          <Link to="/roles"><FiUser /> Roles</Link>
        </li>
        <li className={location.pathname === '/settings' ? 'active' : ''}>
          <Link to="/settings"><FiSettings /> Settings</Link>
        </li>
        <li onClick={handleLogout} >
        <Link > <CiLogout/> Logout</Link>
       
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
