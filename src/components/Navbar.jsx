import { FiGlobe, FiSettings } from 'react-icons/fi';
import '../styles/components.css';
import { CiLogout } from 'react-icons/ci';
import { Link, useNavigate } from 'react-router-dom';
import { IoNotificationsOutline } from "react-icons/io5";
import Swal from 'sweetalert2';
import { CgProfile } from "react-icons/cg";
const Navbar = ({ isLogin }) => {
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

  const handleLogo = () => {
    navigate("/dashboard");
  };

  const navbarClass = `navbar ${isLogin ? "login-page" : "logged-in"}`;

  return (
    <div className={navbarClass}>
      {/* Logo */}
      <div className="logo-container">
        <img
          src={`${process.env.PUBLIC_URL}/assets/bhouselogo.jpg`}
          alt="Logo"
          style={{ width: "16.66666667%", height: "50px", objectFit: "contain", cursor: "pointer" }}
          onClick={handleLogo}
        />
      </div>

      {/* Right Menu */}
      <div className="right-menu">
        <p>
          <FiGlobe style={{ marginRight: "5px" }} /><strong>(English)</strong>
        </p>
        {!isLogin && (
          <>
            <li><IoNotificationsOutline /></li>
            <li> <CgProfile onClick={()=>navigate('/profile')} /></li>
            {/* <Link to="/settings"><FiSettings className='setting' /></Link> */}
            <li onClick={handleLogout}>
              {/* <Link><CiLogout className='logout' /></Link> */}
            </li>
          </>
        )}
      </div>
    </div>
  );
};


export default Navbar;
