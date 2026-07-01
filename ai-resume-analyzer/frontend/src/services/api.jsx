import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const registerUser = (data) =>
  API.post('/api/auth/register', data);

export const loginUser = (data) =>
  API.post('/api/auth/login', data);

export const getProfile = () =>
  API.get('/api/auth/profile');

export const uploadResume = (formData) =>
  API.post('/api/resumes/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const getResumes = () =>
  API.get('/api/resumes');

export const getResumeById = (id) =>
  API.get(`/api/resumes/${id}`);

export const deleteResume = (id) =>
  API.delete(`/api/resumes/${id}`);

export default API;
