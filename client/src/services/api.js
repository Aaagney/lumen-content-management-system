import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

export const fetchContentStats = async () => {
  const response = await API.get('/content/stats');
  return response.data;
};

export const fetchAllContent = async (params = {}) => {
  const response = await API.get('/content', { params });
  return response.data;
};

export const searchContent = async (query) => {
  const response = await API.get(`/content/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

export const fetchContentById = async (id) => {
  const response = await API.get(`/content/${id}`);
  return response.data;
};

export const createContent = async (contentData) => {
  const response = await API.post('/content', contentData);
  return response.data;
};

export const updateContent = async (id, contentData) => {
  const response = await API.put(`/content/${id}`, contentData);
  return response.data;
};

export const deleteContent = async (id) => {
  const response = await API.delete(`/content/${id}`);
  return response.data;
};

export default API;