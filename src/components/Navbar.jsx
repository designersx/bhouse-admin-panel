import { FiSettings } from 'react-icons/fi';
import '../styles/components.css';
import { CiLogout } from 'react-icons/ci';
import { Link, useNavigate } from 'react-router-dom';
import { IoNotificationsOutline } from "react-icons/io5";
import Swal from 'sweetalert2';

const Navbar = () => {
  const navigate = useNavigate();

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

  return (
    <div className="navbar">
      {/* Logo Center */}
        <p>Language <strong>(English)</strong></p> 
      <div className="logo-container">
        <img
          src={`${process.env.PUBLIC_URL}/assets/bhouselogo.jpg`}
          alt="Logo"
          style={{width: "16.66666667%", height: "50px", objectFit: "contain" }}
        />
      </div>

      {/* Settings & Logout Right Side */}
      <div className="right-menu">
        <li><IoNotificationsOutline /></li>
        <Link to="/settings"><FiSettings className='setting'/></Link>
        <li onClick={handleLogout}>
          <Link><CiLogout  className='logout'/></Link>
        </li>
      </div>
    </div>
  );
};

export default Navbar;
