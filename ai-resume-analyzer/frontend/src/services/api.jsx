import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/auth/profile');

export const uploadResume = (formData) =>
  API.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getResumes = () => API.get('/resumes');
export const getResumeById = (id) => API.get(`/resumes/${id}`);
export const deleteResume = (id) => API.delete(`/resumes/${id}`);

export default API;
