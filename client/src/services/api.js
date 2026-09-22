import axios from 'axios';

// Single Base API Configuration
const API = axios.create({
  baseURL: 'http://localhost:5000/api/chat'
});

// 1. Fetch available users
export const getUsers = async () => {
  const response = await API.get('/users');
  return response.data;
};

// 2. Fetch user's conversations
export const getConversations = async (userId) => {
  const response = await API.get(`/conversations/${userId}`);
  return response.data;
};

// 3. Create or open existing conversation
export const createConversation = async (userOneId, userTwoId) => {
  const response = await API.post('/conversations', {
    user_one_id: userOneId,
    user_two_id: userTwoId
  });
  return response.data;
};

// 4. Fetch messages with requesting user validation
export const getMessages = async (conversationId, userId) => {
  const response = await API.get(`/messages/${conversationId}?userId=${userId}`);
  return response.data;
};

// 5. Send message
export const sendMessage = async (data) => {
  const response = await API.post('/messages', data);
  return response.data;
};

// 6. Mark messages read
export const markMessagesRead = async (conversationId, userId) => {
  const response = await API.patch('/messages/read', {
    conversation_id: conversationId,
    user_id: userId
  });
  return response.data;
};