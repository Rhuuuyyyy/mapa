import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mapa-app-clean-8270.azurewebsites.net/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
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

// ============================================================================
// AUTH
// ============================================================================

export const auth = {
  login: async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/admin/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/admin/me');
    return response.data;
  },
};

// ============================================================================
// USERS
// ============================================================================

export const users = {
  getAll: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  create: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  update: async (id, userData) => {
    const response = await api.patch(`/admin/users/${id}`, userData);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/admin/users/${id}`);
  },
};

// ============================================================================
// COMPANIES
// ============================================================================

export const companies = {
  getAll: async () => {
    const response = await api.get('/user/companies');
    return response.data;
  },

  create: async (companyData) => {
    const response = await api.post('/user/companies', companyData);
    return response.data;
  },

  update: async (id, companyData) => {
    const response = await api.patch(`/user/companies/${id}`, companyData);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/user/companies/${id}`);
  },
};

// ============================================================================
// PRODUCTS
// ============================================================================

export const products = {
  getAll: async () => {
    const response = await api.get('/user/products');
    return response.data;
  },

  getByCompany: async (companyId) => {
    const response = await api.get(`/user/companies/${companyId}/products`);
    return response.data;
  },

  create: async (productData) => {
    const response = await api.post('/user/products', productData);
    return response.data;
  },

  update: async (id, productData) => {
    const response = await api.patch(`/user/products/${id}`, productData);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/user/products/${id}`);
  },
};

// ============================================================================
// XML UPLOADS
// ============================================================================

export const xmlUploads = {
  uploadPreview: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/user/upload-preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadConfirm: async (confirmData) => {
    const response = await api.post('/user/upload-confirm', confirmData);
    return response.data;
  },

  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/user/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/user/uploads');
    return response.data;
  },

  delete: async (uploadId) => {
    await api.delete(`/user/uploads/${uploadId}`);
  },
};

// ============================================================================
// REPORTS
// ============================================================================

export const reports = {
  generate: async (period) => {
    const response = await api.post('/user/generate-report', { period });
    return response.data;
  },

  download: async (period) => {
    // Nota: endpoint de download pode não existir, usar o generate por enquanto
    const response = await api.post('/user/generate-report', { period }, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// ============================================================================
// CATALOG
// ============================================================================

export const catalog = {
  get: async () => {
    const response = await api.get('/user/catalog');
    return response.data;
  },
};

export default api;
