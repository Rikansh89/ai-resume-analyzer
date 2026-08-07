import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 60000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    const method = (config?.method || '').toLowerCase();
    const isIdempotent = ['get', 'delete', 'head', 'options'].includes(method);
    const retryable = !error.response || error.response.status >= 500 || error.code === 'ECONNABORTED';

    if (config && !config._retried && isIdempotent && retryable) {
      config._retried = true;
      await new Promise((resolve) => setTimeout(resolve, 2500));
      return API(config);
    }

    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const registerUser = (data) =>
  API.post('/api/auth/register', data);

export const loginUser = (data) =>
  API.post('/api/auth/login', data);

export const forgotPassword = (email) =>
  API.post('/api/auth/forgot-password', { email });

export const resetPassword = (data) =>
  API.post('/api/auth/reset-password', data);

export const getProfile = () =>
  API.get('/api/auth/profile');

export const uploadResume = (formData) =>
  API.post('/api/resumes/upload', formData);

export const getResumes = () =>
  API.get('/api/resumes');

export const getResumeById = (id) =>
  API.get(`/api/resumes/${id}`);

export const deleteResume = (id) =>
  API.delete(`/api/resumes/${id}`);

export default API;
