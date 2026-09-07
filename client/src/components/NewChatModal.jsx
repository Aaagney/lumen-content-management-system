import React from 'react';

const NewChatModal = ({ isOpen, onClose, users, currentUserId, onSelectUser }) => {
  if (!isOpen) return null;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Filter out current logged-in user
  const availableUsers = users.filter((u) => u.id !== currentUserId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>New Chat</h3>
          <button className="btn-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <ul className="user-select-list">
          {availableUsers.length === 0 ? (
            <li className="empty-state" style={{ padding: '16px' }}>
              No other users available.
            </li>
          ) : (
            availableUsers.map((user) => (
              <li
                key={user.id}
                className="user-select-item"
                onClick={() => onSelectUser(user.id)}
              >
                <div className="avatar">{getInitials(user.name)}</div>
                <div>
                  <div style={{ fontWeight: '600' }}>{user.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{user.email}</div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default NewChatModal;