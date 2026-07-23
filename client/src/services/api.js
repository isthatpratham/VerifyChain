import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
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

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const registerUser = async (data) => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await apiClient.post('/auth/login', data);
  return response.data;
};

export const getMe = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

// MSME Profile Services
export const getMsmeProfile = async () => {
  const response = await apiClient.get('/msme/profile');
  return response.data;
};

export const createMsmeProfile = async (profileData) => {
  const response = await apiClient.post('/msme/profile', profileData);
  return response.data;
};

export const updateMsmeProfile = async (profileData) => {
  const response = await apiClient.patch('/msme/profile', profileData);
  return response.data;
};

// Business Verification Services
export const verifyGstin = async (gstin) => {
  const response = await apiClient.post('/msme/verify/gstin', { gstin });
  return response.data;
};

export const verifyPan = async (pan) => {
  const response = await apiClient.post('/msme/verify/pan', { pan });
  return response.data;
};

export const verifyUdyam = async (udyamNumber) => {
  const response = await apiClient.post('/msme/verify/udyam', { udyamNumber });
  return response.data;
};

export const getVerificationStatus = async () => {
  const response = await apiClient.get('/msme/verification/status');
  return response.data;
};

export default apiClient;
