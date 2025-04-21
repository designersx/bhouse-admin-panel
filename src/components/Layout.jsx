import Sidebar from './Sidebar';
import Navbar from './Navbar';
import '../styles/layout.css'
import Offcanvas from './OffCanvas/OffCanvas';
const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;

