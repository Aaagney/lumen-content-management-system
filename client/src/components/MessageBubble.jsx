import React from 'react';

const MessageBubble = ({ message, currentUserId }) => {
  const isSent = message.sender_id === currentUserId;

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message-wrapper ${isSent ? 'sent' : 'received'}`}>
      <div className="message-bubble">
        {message.message}
      </div>
      <span className="message-time">
        {formatTime(message.created_at)}
      </span>
    </div>
  );
};

export default MessageBubble;