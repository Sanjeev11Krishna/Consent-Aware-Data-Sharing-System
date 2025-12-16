import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => {
    // Transform frontend data structure to match backend expectations
    const transformedData = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      personalInfo: userData.personalInfo
    };
    return api.post('/auth/register', transformedData);
  },
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
};

// Consent API
export const consentAPI = {
  requestConsent: (consentData) => api.post('/consents/request', consentData),
  getPendingRequests: () => api.get('/consents/pending-requests'),
  acceptConsentRequest: (consentId, acceptData = {}) => api.put(`/consents/accept/${consentId}`, acceptData),
  declineConsentRequest: (consentId) => api.put(`/consents/decline/${consentId}`),
  getUserConsents: () => api.get('/consents/my-consents'),
  getGrantedConsents: () => api.get('/consents/granted-consents'),
  revokeConsent: (consentId) => api.put(`/consents/revoke/${consentId}`),
  requestDataAccess: (requestData) => api.post('/consents/request-data', requestData),
};

// Audit API
export const auditAPI = {
  getUserLogs: () => api.get('/audit/my-logs'),
};

export default api;