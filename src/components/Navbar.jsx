import { FiGlobe, FiSettings } from 'react-icons/fi';
import '../styles/components.css';
import { CiLogout } from 'react-icons/ci';
import { Link, useNavigate } from 'react-router-dom';
import { IoNotificationsOutline } from "react-icons/io5";
import Swal from 'sweetalert2';
import { CgProfile } from "react-icons/cg";
import { useState } from 'react';
import Offcanvas from './OffCanvas/OffCanvas';
import { getNotificationsByUser } from '../lib/api';
import { useEffect } from 'react';
const Navbar = ({ isLogin }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"))
  const [openOffcanvas, setOpenOffcanvas] = useState(false)
  const [notification, setNotification] = useState([])
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
  const handleOpenOffcanvas = () => {
    setOpenOffcanvas(true)
  }
  const handleCloseOffcanvas = () => setOpenOffcanvas(false);

  const navbarClass = `navbar ${isLogin ? "login-page" : "logged-in"}`;
  const fetchNotification = async () => {
    try {
      const response = await getNotificationsByUser(user?.user?.id)
      setNotification(response.data.notifications
      )
    } catch (error) {
      console.log(error)
    }

  }
  function formatNotificationTime(dateString) {
    const inputDate = new Date(dateString);
    const now = new Date();

    const isToday =
      inputDate.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const isYesterday =
      inputDate.toDateString() === yesterday.toDateString();

    const time = inputDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    if (isToday) {
      return `Today at ${time}`;
    } else if (isYesterday) {
      return `Yesterday at ${time}`;
    } else {
      const month = inputDate.toLocaleString('default', { month: 'short' });
      const day = inputDate.getDate();
      return `${month} ${day} at ${time}`;
    }
  }
  const handleRefresh = () => {
    fetchNotification()
  }
  useEffect(() => {
    fetchNotification()
  }, [])
const usr = JSON.parse(localStorage.getItem("user"))
let loggedInUserId = usr?.user?.id
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
            <li onClick={handleOpenOffcanvas}><IoNotificationsOutline />    </li>
            <li> <CgProfile onClick={() => navigate('/profile')} /></li>
            {/* <Link to="/settings"><FiSettings className='setting' /></Link> */}
            <li onClick={handleLogout}>
              {/* <Link><CiLogout className='logout' /></Link> */}
            </li>
          </>
        )}
      </div>
      {openOffcanvas && <Offcanvas isOpen={openOffcanvas} closeOffcanvas={handleCloseOffcanvas} getLatestComment={handleRefresh} >
      {notification.length > 0 ? notification
  .filter(
    (message) => message.user_id === loggedInUserId && message.role === "user"
  )
  .map((message) => {
    return (
      <div key={message.id} className="notification-container">
        <div className="notification-card">
          <div className="notification-header">
            <span className="sender-name">{message.senderName}</span>
            <span className="notification-time">{formatNotificationTime(message.createdAt)}</span>
          </div>
          <div className="notification-message">
            {message.message}
          </div>
        </div>
      </div>
    );
  }) : "No data"}





      </Offcanvas>}

    </div>
  );
};


export default Navbar;
