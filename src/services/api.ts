import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001/api' : '/api');

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken');
  const customerToken = localStorage.getItem('customerToken');
  
  if (adminToken && window.location.pathname.startsWith('/xrp')) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (customerToken) {
    config.headers.Authorization = `Bearer ${customerToken}`;
  } else if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
});

export const AuthService = {
  login: async (credentials: any) => {
    const res = await api.post('/login', credentials);
    if (res.data.token) {
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminUser', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  },
  isAuthenticated: () => {
    if (localStorage.getItem('adminToken')) return true;
    const userStr = localStorage.getItem('customerUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.role === 'admin';
      } catch (e) {
        return false;
      }
    }
    return false;
  },
  
  customerLogin: async (credentials: any) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data.token) {
      localStorage.setItem('customerToken', res.data.token);
      localStorage.setItem('customerUser', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  customerRegister: async (data: any) => {
    const res = await api.post('/auth/register', data);
    if (res.data.token) {
      localStorage.setItem('customerToken', res.data.token);
      localStorage.setItem('customerUser', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  customerLogout: () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerUser');
  },
  isCustomerAuthenticated: () => {
    return !!localStorage.getItem('customerToken');
  }
};

export const ProductService = {
  getProducts: (params?: any) => api.get('/products', { params }).then(res => res.data),
  createProduct: (data: any) => api.post('/products', data).then(res => res.data),
  updateProduct: (id: string, data: any) => api.put(`/products/${id}`, data).then(res => res.data),
  deleteProduct: (id: string) => api.delete(`/products/${id}`).then(res => res.data),
  uploadImages: (formData: FormData) => api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data)
};

export const CategoryService = {
  getCategories: () => api.get('/categories').then(res => res.data),
  createCategory: (data: any) => api.post('/categories', data).then(res => res.data),
  updateCategory: (id: string, data: any) => api.put(`/categories/${id}`, data).then(res => res.data),
  deleteCategory: (id: string) => api.delete(`/categories/${id}`).then(res => res.data),
};

export const CollectionService = {
  getCollections: () => api.get('/collections').then(res => res.data),
  createCollection: (data: any) => api.post('/collections', data).then(res => res.data),
  updateCollection: (id: string, data: any) => api.put(`/collections/${id}`, data).then(res => res.data),
  deleteCollection: (id: string) => api.delete(`/collections/${id}`).then(res => res.data),
};

export const ColorService = {
  getColors: () => api.get('/colors').then(res => res.data),
  createColor: (data: any) => api.post('/colors', data).then(res => res.data),
  updateColor: (id: string, data: any) => api.put(`/colors/${id}`, data).then(res => res.data),
  deleteColor: (id: string) => api.delete(`/colors/${id}`).then(res => res.data),
};

export const SizeService = {
  getSizes: () => api.get('/sizes').then(res => res.data),
  createSize: (data: any) => api.post('/sizes', data).then(res => res.data),
  updateSize: (id: string, data: any) => api.put(`/sizes/${id}`, data).then(res => res.data),
  deleteSize: (id: string) => api.delete(`/sizes/${id}`).then(res => res.data),
};

export const BannerService = {
  getBanners: () => api.get('/banners').then(res => res.data),
  createBanner: (data: any) => api.post('/banners', data).then(res => res.data),
  updateBanner: (id: string, data: any) => api.put(`/banners/${id}`, data).then(res => res.data),
  deleteBanner: (id: string) => api.delete(`/banners/${id}`).then(res => res.data),
};

export const SettingService = {
  getSettings: () => api.get('/settings').then(res => res.data),
  saveSetting: (key: string, value: string) => api.post('/settings', { key, value }).then(res => res.data),
};

export const CouponService = {
  getCoupons: () => api.get('/coupons').then(res => res.data),
  createCoupon: (data: any) => api.post('/coupons', data).then(res => res.data),
  updateCoupon: (id: string, data: any) => api.put(`/coupons/${id}`, data).then(res => res.data),
  deleteCoupon: (id: string) => api.delete(`/coupons/${id}`).then(res => res.data),
};

export const OrderService = {
  getOrders: () => api.get('/orders').then(res => res.data),
  getCustomerOrders: () => api.get('/orders/me').then(res => res.data),
  createOrder: (data: any) => api.post('/orders', data).then(res => res.data),
  updateOrder: (id: string, data: any) => api.put(`/orders/${id}`, data).then(res => res.data),
  deleteOrder: (id: string) => api.delete(`/orders/${id}`).then(res => res.data),
};

export const CustomerService = {
  getCustomers: () => api.get('/customers').then(res => res.data),
  updateCustomer: (id: string, data: any) => api.put(`/customers/${id}`, data).then(res => res.data),
  deleteCustomer: (id: string) => api.delete(`/customers/${id}`).then(res => res.data),
};
