import React from 'react';
import './offcanvas.css';  

const Offcanvas = ({ isOpen, closeOffcanvas, children }) => {
  return (
    <>
      {/* Backdrop Overlay (fades background) */}
      {/* {isOpen && <div className="offcanvas-backdrop" onClick={closeOffcanvas}></div>} */}

      <div className={`offcanvas-container ${isOpen ? 'open' : ''}`}>
        <div className="offcanvas">
          <div className="offcanvas-content">
            <button onClick={closeOffcanvas} className="close-btn">
              &times;
            </button>
            
            <div className="offcanvas-body">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Offcanvas;
