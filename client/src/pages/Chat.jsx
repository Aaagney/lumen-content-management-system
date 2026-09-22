import React, { useState, useEffect } from 'react';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import NewChatModal from '../components/NewChatModal';
import {
  getUsers,
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  markMessagesRead
} from '../services/api';

const Chat = () => {
  // Demo simulate Loga Shree (id: 1) by default
  const [currentUserId, setCurrentUserId] = useState(1);
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Fetch Users on mount
  useEffect(() => {
    fetchUsersList();
  }, []);

  // 2. Fetch Conversations whenever current user changes
  useEffect(() => {
    fetchUserConversations(currentUserId);
    setActiveConvId(null);
    setMessages([]);
  }, [currentUserId]);

  // 3. Fetch Messages & mark as read when active conversation changes
  useEffect(() => {
    if (activeConvId) {
      fetchConversationMessages(activeConvId, currentUserId);
      handleMarkAsRead(activeConvId, currentUserId);
    }
  }, [activeConvId, currentUserId]);

  const fetchUsersList = async () => {
    try {
      const res = await getUsers();
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchUserConversations = async (userId) => {
    try {
      const res = await getConversations(userId);
      if (res.success) {
        setConversations(res.data);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  const fetchConversationMessages = async (convId, userId) => {
    try {
      setErrorMessage('');
      const res = await getMessages(convId, userId);
      if (res.success) {
        setMessages(res.data);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to load messages.');
    }
  };

  const handleMarkAsRead = async (convId, userId) => {
    try {
      await markMessagesRead(convId, userId);
      // Refresh conversations list to update unread badge counts
      const res = await getConversations(userId);
      if (res.success) setConversations(res.data);
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const handleSelectConversation = (convId) => {
    setActiveConvId(convId);
  };

  const handleStartNewChat = async (targetUserId) => {
    try {
      setIsModalOpen(false);
      const res = await createConversation(currentUserId, targetUserId);
      if (res.success) {
        const convId = res.data.id;
        await fetchUserConversations(currentUserId);
        setActiveConvId(convId);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating conversation.');
    }
  };

  const handleSendMessageText = async (text) => {
    if (!activeConvId) return;

    const activeConv = conversations.find((c) => c.conversation_id === activeConvId);
    if (!activeConv) return;

    try {
      setErrorMessage('');
      const payload = {
        conversation_id: activeConvId,
        sender_id: currentUserId,
        receiver_id: activeConv.other_user_id,
        message: text
      };

      const res = await sendMessage(payload);
      if (res.success) {
        setMessages((prev) => [...prev, res.data]);
        fetchUserConversations(currentUserId);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to send message.');
    }
  };

  const activeConversation = conversations.find((c) => c.conversation_id === activeConvId);

  return (
    <div>
      {/* Top Header Bar */}
      <header className="cms-header">
        <div className="cms-brand">
          <div className="cms-logo">CMS</div>
          <h1 className="cms-title">Personal Chat Module</h1>
        </div>
        <div className="cms-user-sim">
          <label htmlFor="user-switch">Logged in as: </label>
          <select
            id="user-switch"
            value={currentUserId}
            onChange={(e) => setCurrentUserId(Number(e.target.value))}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Chat Layout */}
      <div className="chat-container">
        <div className={`chat-card ${activeConvId ? 'mobile-active-chat' : ''}`}>
          <ChatList
            conversations={conversations}
            activeConvId={activeConvId}
            onSelectConversation={handleSelectConversation}
            onOpenNewChatModal={() => setIsModalOpen(true)}
          />

          <ChatWindow
            activeConversation={activeConversation}
            messages={messages}
            currentUserId={currentUserId}
            onSendMessage={handleSendMessageText}
            onBack={() => setActiveConvId(null)}
            error={errorMessage}
          />
        </div>
      </div>

      {/* New Chat Selection Modal */}
      <NewChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        users={users}
        currentUserId={currentUserId}
        onSelectUser={handleStartNewChat}
      />
    </div>
  );
};

export default Chat;