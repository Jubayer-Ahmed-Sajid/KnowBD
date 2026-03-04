import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('itihas_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthRoute) {
        localStorage.removeItem('itihas_token');
        localStorage.removeItem('itihas_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
  getBookmarks: () => api.get('/auth/bookmarks'),
  toggleBookmark: (placeId) => api.put(`/auth/bookmarks/${placeId}`),
  toggleVisited: (placeId) => api.put(`/auth/visited/${placeId}`),
};

export const placesAPI = {
  getAll: (params) => api.get('/places', { params }),
  getFeatured: () => api.get('/places/featured'),
  search: (q) => api.get('/places/search', { params: { q } }),
  getStats: () => api.get('/places/stats'),
  getMapAll: () => api.get('/places/map/all'),
  getNearby: (lat, lng) => api.get('/places/nearby', { params: { lat, lng } }),
  getByCategory: (cat) => api.get(`/places/category/${cat}`),
  getByEra: (era) => api.get(`/places/era/${era}`),
  getBySlug: (slug) => api.get(`/places/${slug}`),
  create: (data) => api.post('/places', data),
  update: (id, data) => api.put(`/places/${id}`, data),
  delete: (id) => api.delete(`/places/${id}`),
};

export const reviewsAPI = {
  getAll: (params) => api.get('/reviews', { params }),
  create: (placeId, data) => api.post(`/places/${placeId}/reviews`, data),
  getById: (id) => api.get(`/reviews/${id}`),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  markHelpful: (id) => api.put(`/reviews/${id}/helpful`),
};

export const storiesAPI = {
  getAll: (params) => api.get('/stories', { params }),
  create: (data) => api.post('/stories', data),
  getById: (id) => api.get(`/stories/${id}`),
  update: (id, data) => api.put(`/stories/${id}`, data),
  delete: (id) => api.delete(`/stories/${id}`),
  like: (id) => api.put(`/stories/${id}/like`),
  approve: (id) => api.put(`/stories/${id}/approve`),
};

export const usersAPI = {
  getDashboard: () => api.get('/users/dashboard'),
  getAll: () => api.get('/users'),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  delete: (id) => api.delete(`/users/${id}`),
  getPendingStories: () => api.get('/users/stories/pending'),
  bulkApproveStories: (ids) => api.put('/users/stories/bulk-approve', { ids }),
};

export default api;
