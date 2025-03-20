import React from 'react';
import '../../styles/modal.css';

const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">{title}</h3>
        {children}
        <button className="close-btn" onClick={onClose}>✖</button>
      </div>
    </div>
  );
};

export default Modal;
