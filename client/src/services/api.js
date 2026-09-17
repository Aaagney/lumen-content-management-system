import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// User & Reputation APIs
export const fetchDashboardStats = async () => {
  const response = await apiClient.get('/stats');
  return response.data;
};

export const fetchUsers = async (params = {}) => {
  const response = await apiClient.get('/users', { params });
  return response.data;
};

export const fetchUserDetail = async (userId) => {
  const response = await apiClient.get(`/users/${userId}`);
  return response.data;
};

export const fetchUserHistory = async (userId) => {
  const response = await apiClient.get(`/users/${userId}/reputation-history`);
  return response.data;
};

export const recordReputationAction = async (userId, data) => {
  const response = await apiClient.post(`/users/${userId}/reputation`, data);
  return response.data;
};

export const updateUserStatus = async (userId, status) => {
  const response = await apiClient.put(`/users/${userId}/status`, { account_status: status });
  return response.data;
};

export const resetDatabaseSeed = async () => {
  const response = await apiClient.post('/reset-seed');
  return response.data;
};

export default apiClient;
