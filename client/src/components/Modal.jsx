import React from 'react';

const Modal = ({ isOpen, title, children, onConfirm, onCancel, confirmText = 'Confirm' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontFamily: 'var(--font-serif)' }}>{title}</h3>
        <div style={{ color: '#4b5563', fontSize: '0.95rem' }}>{children}</div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-green" style={{ backgroundColor: '#ef4444' }} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;