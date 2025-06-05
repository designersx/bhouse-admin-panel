import React from 'react';
import './offcanvas.css';  
import { LuRefreshCw } from "react-icons/lu";
const Offcanvas = ({ isOpen, closeOffcanvas, children  , getLatestComment}) => {
  return (
    <>
      <div className={`offcanvas-container ${isOpen ? 'open' : ''}`}>
        <div className="offcanvas">
          <div className="offcanvas-content">
            <button onClick={closeOffcanvas} className="close-btn">
              &times;
            </button>
           <LuRefreshCw onClick={getLatestComment} style={{cursor:"pointer"}}/>  
            <hr className="CanvaHrLIne"></hr>
            <div className="offcanvas-body">{children}</div>
          
          </div>
        </div>
      </div>
    </>
  );
};

export default Offcanvas;
