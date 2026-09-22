import React from 'react';

const ChatList = ({ conversations, activeConvId, onSelectConversation, onOpenNewChatModal }) => {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-sidebar">
      <div className="sidebar-header">
        <h2>Messages</h2>
        <button className="btn-new-chat" onClick={onOpenNewChatModal}>
          + New Chat
        </button>
      </div>

      <div className="conversation-list">
        {conversations.length === 0 ? (
          <div className="empty-state" style={{ padding: '20px' }}>
            No conversations yet.
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.conversation_id}
              className={`conversation-item ${activeConvId === conv.conversation_id ? 'active' : ''}`}
              onClick={() => onSelectConversation(conv.conversation_id)}
            >
              <div className="avatar">
                {getInitials(conv.other_user_name)}
              </div>
              <div className="conv-info">
                <div className="conv-top">
                  <span className="conv-name">{conv.other_user_name}</span>
                  <span className="conv-time">{formatTime(conv.last_message_time)}</span>
                </div>
                <div className="conv-bottom">
                  <span className="conv-last-msg">
                    {conv.last_message || 'No messages yet'}
                  </span>
                  {conv.unread_count > 0 && (
                    <span className="unread-badge">{conv.unread_count}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;