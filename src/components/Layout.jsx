import Sidebar from './Sidebar';
import Navbar from './Navbar';
import '../styles/layout.css'
import Offcanvas from './OffCanvas/OffCanvas';
const Layout = ({ children }) => {
  return (
    <div className="layout">
      <div className='side_Bar'>

      <Sidebar />
      </div>
      
      <div className="main-content">
        <div className="content">
        <Navbar />
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;

