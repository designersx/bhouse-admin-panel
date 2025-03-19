import { FiHome, FiUsers, FiSettings, FiUser } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import '../styles/components.css';

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="sidebar">
      <div className="logo">🚀 Admin Panel</div>
      <ul>
        <li className={location.pathname === '/' ? 'active' : ''}>
          <Link to="/"><FiHome /> Dashboard</Link>
        </li>
        <li className={location.pathname === '/users' ? 'active' : ''}>
          <Link to="/users"><FiUsers /> Users</Link>
        </li>
        <li className={location.pathname === '/profile' ? 'active' : ''}>
          <Link to="/profile"><FiUser /> Profile</Link>
        </li>
        <li className={location.pathname === '/settings' ? 'active' : ''}>
          <Link to="/settings"><FiSettings /> Settings</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
