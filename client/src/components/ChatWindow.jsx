import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

const ChatWindow = ({
  activeConversation,
  messages,
  currentUserId,
  onSendMessage,
  onBack,
  error
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  if (!activeConversation) {
    return (
      <div className="chat-window">
        <div className="empty-state">
          Select a conversation or start a new chat
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <button className="btn-back" onClick={onBack}>
          ←
        </button>
        <div className="avatar">
          {getInitials(activeConversation.other_user_name)}
        </div>
        <div>
          <h3>{activeConversation.other_user_name}</h3>
        </div>
      </div>

      <div className="chat-messages">
        {error && <div className="error-banner">{error}</div>}
        {messages.length === 0 ? (
          <div className="empty-state">No messages in this chat yet.</div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} currentUserId={currentUserId} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <form onSubmit={handleSubmit} className="chat-form">
          <input
            type="text"
            className="chat-input"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="btn-send">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;