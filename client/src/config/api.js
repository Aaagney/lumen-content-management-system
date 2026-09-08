// Centralized API configuration for React + Vite frontend
// Talks to the existing Express REST API server at http://localhost:5000/api
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  SUBSCRIBE: `${API_BASE_URL}/subscribe`,
  ARTICLES: `${API_BASE_URL}/articles`,
  USERS: `${API_BASE_URL}/users`,
};

export default API_BASE_URL;
