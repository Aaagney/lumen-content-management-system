import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'x-admin-id': 'admin' }
});

export const spamApi = {
  getStats: () => api.get('/spam/stats').then((r) => r.data),

  getDetections: (params) => api.get('/spam/detections', { params }).then((r) => r.data),

  getDetection: (id) => api.get(`/spam/detections/${id}`).then((r) => r.data),

  takeAction: (id, payload) => api.post(`/spam/detections/${id}/action`, payload).then((r) => r.data),

  getUserActivity: (userId) => api.get(`/spam/users/${userId}/activity`).then((r) => r.data),

  restrictUser: (userId, payload) => api.post(`/spam/users/${userId}/restrict`, payload).then((r) => r.data),

  unrestrictUser: (userId, payload) => api.post(`/spam/users/${userId}/unrestrict`, payload).then((r) => r.data),

  getAudit: (params) => api.get('/spam/audit', { params }).then((r) => r.data),

  // Demo content-submission endpoints (simulate a real CMS creating posts/comments)
  submitPost: (payload) => api.post('/content/posts', payload).then((r) => r.data),
  submitComment: (payload) => api.post('/content/comments', payload).then((r) => r.data)
};

export default api;
