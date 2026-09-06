const API_BASE_URL = 'http://localhost:5000/api';

// Helper to set headers with authorization
const getHeaders = () => {
  const token = localStorage.getItem('lumen_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // Login
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    localStorage.setItem('lumen_token', data.token);
    return data;
  },

  // Register
  register: async (fullname, email, password, role) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullname, email, password, role })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    localStorage.setItem('lumen_token', data.token);
    return data;
  },

  // Get current user profile
  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders()
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user');
    }
    return data;
  },

  // Update profile details
  updateProfile: async (fullname, bio) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ fullname, bio })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }
    return data;
  },

  // Fetch articles (optional author_id)
  getArticles: async (authorId = null) => {
    const url = authorId 
      ? `${API_BASE_URL}/articles?author_id=${authorId}` 
      : `${API_BASE_URL}/articles`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch articles');
    }
    return data.articles;
  },

  // Fetch all users (for the navbar role-switcher)
  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: getHeaders()
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch users');
    }
    return data.users;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('lumen_token');
  }
};
