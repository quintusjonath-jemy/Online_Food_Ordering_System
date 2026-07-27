import axios from 'axios';

const BASE_URL = 'http://localhost/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:    (data) => api.post('/auth.php', data),
  register: (data) => api.post('/auth.php?action=register', data),
  getMe:    ()     => api.get('/auth.php'),
};

// ── Foods ─────────────────────────────────────────────────────────────────────
export const foodsAPI = {
  getAll:   (params) => api.get('/foods.php', { params }),
  getById:  (id)     => api.get(`/foods.php?id=${id}`),
  create:   (data)   => api.post('/foods.php', data),
  update:   (id, data) => api.put(`/foods.php?id=${id}`, data),
  delete:   (id)     => api.delete(`/foods.php?id=${id}`),
};

// ── Categories ────────────────────────────────────────────────────────────────
export const categoriesAPI = {
  getAll:  ()          => api.get('/categories.php'),
  create:  (data)      => api.post('/categories.php', data),
  update:  (id, data)  => api.put(`/categories.php?id=${id}`, data),
  delete:  (id)        => api.delete(`/categories.php?id=${id}`),
};

// ── Cart ──────────────────────────────────────────────────────────────────────
export const cartAPI = {
  getCart:        ()         => api.get('/cart.php'),
  addItem:        (data)     => api.post('/cart.php', data),
  updateQuantity: (id, qty)  => api.put(`/cart.php?id=${id}`, { quantity: qty }),
  removeItem:     (id)       => api.delete(`/cart.php?id=${id}`),
  clearCart:      ()         => api.delete('/cart.php?clear=1'),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const ordersAPI = {
  getMyOrders:  (params)       => api.get('/orders.php', { params }),
  getById:      (id)           => api.get(`/orders.php?id=${id}`),
  checkout:     (data)         => api.post('/orders.php', data),
  updateStatus: (id, status)   => api.put(`/orders.php?id=${id}`, { status }),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getAll:    ()          => api.get('/users.php'),
  update:    (data)      => api.put('/users.php', data),
  delete:    (id)        => api.delete(`/users.php?id=${id}`),
};

// ── Admin Stats ───────────────────────────────────────────────────────────────
export const statsAPI = {
  getDashboard: () => api.get('/stats.php'),
};

// ── File Upload ───────────────────────────────────────────────────────────────
export const uploadAPI = {
  uploadImage: (formData) =>
    api.post('/upload.php', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ── Reservations ─────────────────────────────────────────────────────────────
export const reservationsAPI = {
  getAll:       (params) => api.get('/reservations.php', { params }),
  getMyBookings:()       => api.get('/reservations.php'),
  getById:      (id)     => api.get(`/reservations.php?id=${id}`),
  create:       (data)   => api.post('/reservations.php', data),
  updateStatus: (id, status) => api.put(`/reservations.php?id=${id}`, { status }),
};

// ── Coupons ──────────────────────────────────────────────────────────────────
export const couponsAPI = {
  validate: (code, subtotal) => api.post('/coupons.php', { code, subtotal }),
};

export default api;
