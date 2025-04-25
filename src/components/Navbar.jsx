import { FiGlobe } from 'react-icons/fi';
import '../styles/components.css';
import { CiLogout } from 'react-icons/ci';
import { Link, useNavigate } from 'react-router-dom';
import { IoNotificationsOutline } from "react-icons/io5";
import Swal from 'sweetalert2';
import { CgProfile } from "react-icons/cg";
import { useState, useEffect } from 'react';
import Offcanvas from './OffCanvas/OffCanvas';
import Modal from '../../src/components/Modal/Model';
import { getNotificationsByUser, markNotificationRead } from '../lib/api';

const Navbar = ({ isLogin }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [openOffcanvas, setOpenOffcanvas] = useState(false);
  const [notification, setNotification] = useState([]);
  const [modalData, setModalData] = useState(null);

  const fetchNotification = async () => {
    try {
      const response = await getNotificationsByUser(user?.user?.id);
      setNotification(response.data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const formatNotificationTime = (dateString) => {
    const inputDate = new Date(dateString);
    const now = new Date();
    const isToday = inputDate.toDateString() === now.toDateString();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = inputDate.toDateString() === yesterday.toDateString();

    const time = inputDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    if (isToday) return `Today at ${time}`;
    if (isYesterday) return `Yesterday at ${time}`;
    const month = inputDate.toLocaleString('default', { month: 'short' });
    const day = inputDate.getDate();
    return `${month} ${day} at ${time}`;
  };

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

  const handleNotificationClick = async (message) => {
    if (message.path) {
      const encodedPath = message.path
        .split('/')
        .map(part => encodeURIComponent(part))
        .join('/');
  
      navigate(encodedPath, {
        state: {
          notificationId: message.id,
          filePath: message.filePath || null,
          category : message?.documentType
        },
      });
      await markNotificationRead(message.id);
  
      // Don't mark it read yet — let it happen on the opened page
    }else {
      // Show modal and mark as read
      setModalData(message);
      if (!message.isRead) {
        try {
          await markNotificationRead(message.id);
          fetchNotification();
        } catch (error) {
          console.error("Failed to mark notification as read:", error);
        }
      }
    }
  };

  const unreadCount = notification.filter(
    (msg) => msg.user_id === user?.user?.id && msg.role === 'user' && !msg.isRead
  ).length;

  useEffect(() => {
    fetchNotification();
  }, []);

  const handleLogo = () => navigate("/dashboard");
  const handleOpenOffcanvas = () => setOpenOffcanvas(true);
  const handleCloseOffcanvas = () => setOpenOffcanvas(false);
  const navbarClass = `navbar ${isLogin ? "login-page" : "logged-in"}`;
  const loggedInUserId = user?.user?.id;

  return (
    <div className={navbarClass}>
      <div className="logo-container">
        <img
          src={`${process.env.PUBLIC_URL}/assets/bhouselogo.jpg`}
          alt="Logo"
          style={{ width: "16.66666667%", height: "50px", objectFit: "contain", cursor: "pointer" }}
          onClick={handleLogo}
        />
      </div>

      <div className="right-menu">
        <p><FiGlobe style={{ marginRight: "5px" }} /><strong>(EN)</strong></p>
        {!isLogin && (
          <>
            <li onClick={handleOpenOffcanvas} style={{ position: 'relative' }}>
              <IoNotificationsOutline />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </li>
            <li><CgProfile onClick={() => navigate('/profile')} /></li>
            <li onClick={handleLogout}><CiLogout /></li>
          </>
        )}
      </div>

      {openOffcanvas && (
        <Offcanvas
          isOpen={openOffcanvas}
          closeOffcanvas={handleCloseOffcanvas}
          getLatestComment={fetchNotification}
        >
          {notification.length > 0 ? notification
            .filter(msg => msg.user_id === loggedInUserId && msg.role === "user")
            .map(msg => (
              <div key={msg.id} className="notification-container" onClick={() => handleNotificationClick(msg)}>
                <div className={`notification-card ${msg.isRead ? 'read' : 'unread'}`}>
                  <div className="notification-header">
                    <span className="sender-name">{msg.senderName}</span>
                    <span className="notification-time">{formatNotificationTime(msg.createdAt)}</span>
                  </div>
                  <div className="notification-message">{msg.message}</div>
                </div>
              </div>
            )) : "No data"}
        </Offcanvas>
      )}

      {modalData && (
        <Modal isOpen={true} onClose={() => setModalData(null)} title="Notification Details">
          <p><strong>From:</strong> {modalData.senderName}</p>
          <p><strong>Message:</strong> {modalData.message}</p>
          <p><strong>Time:</strong> {formatNotificationTime(modalData.createdAt)}</p>
        </Modal>
      )}
    </div>
  );
};

export default Navbar;
