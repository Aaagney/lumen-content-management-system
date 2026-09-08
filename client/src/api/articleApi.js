import axios from 'axios';

const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Fetch list of articles, optionally filtered by category
 * @param {string} [category] - Filter by category (e.g. 'Science', 'Technology')
 * @returns {Promise<Array>}
 */
export const getArticles = async (category) => {
  const params = {};
  if (category && category.toLowerCase() !== 'all') {
    params.category = category;
  }
  const response = await api.get('/api/articles', { params });
  return response.data;
};

/**
 * Search articles by text query and optional category filter
 * @param {string} query - Search term
 * @param {string} [category] - Filter by category
 * @returns {Promise<Array>}
 */
export const searchArticles = async (query, category) => {
  const params = {};
  if (query && query.trim() !== '') {
    params.q = query.trim();
  }
  if (category && category.toLowerCase() !== 'all') {
    params.category = category;
  }

  // If no query string, route to /api/articles
  if (!params.q) {
    const response = await api.get('/api/articles', { params: { category: params.category } });
    return response.data;
  }

  const response = await api.get('/api/articles/search', { params });
  return response.data;
};

/**
 * Fetch article details by ID (increments view count on server)
 * @param {string|number} id - Article ID
 * @returns {Promise<Object>}
 */
export const getArticleById = async (id) => {
  const response = await api.get(`/api/articles/${id}`);
  return response.data;
};

/**
 * Fetch quizzes data
 * @param {string|number} id - Article ID
 * @returns {Promise<Array>}
 */
export const getQuizForArticle = async (id) => {
  const response = await api.get('/data/quizzes.json');
  const allQuizzes = response.data;
  return allQuizzes[String(id)] || [];
};

export default api;
