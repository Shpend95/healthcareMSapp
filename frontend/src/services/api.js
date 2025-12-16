import axios from 'axios';
import { AUTH_KEY } from '../context/AuthContext';

const API_BASE_URL = 'http://98.91.239.123:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically if present
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const stored =
      window.localStorage.getItem(AUTH_KEY) || window.sessionStorage.getItem(AUTH_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const token = parsed.token;
        if (token) {
          // eslint-disable-next-line no-param-reassign
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        // ignore malformed auth data
      }
    }
  }
  return config;
});

// Patient APIs
export const patientService = {
  register: (patientData) => api.post('/patients', patientData),
  getAll: () => api.get('/patients'),
  getById: (id) => api.get(`/patients/${id}`),
};

// Doctor APIs
export const doctorService = {
  getAll: () => api.get('/doctors'),
  getById: (id) => api.get(`/doctors/${id}`),
  getBySpecialization: (specialization) => api.get(`/doctors/specialization/${specialization}`),
};

// Appointment APIs
export const appointmentService = {
  create: (appointmentData) => api.post('/appointments', appointmentData),
  getAll: () => api.get('/appointments'),
  getById: (id) => api.get(`/appointments/${id}`),
  getByPatientId: (patientId) => api.get(`/appointments/patient/${patientId}`),
  update: (id, appointmentData) => api.put(`/appointments/${id}`, appointmentData),
  delete: (id) => api.delete(`/appointments/${id}`),
};

// Test Results APIs
export const testResultService = {
  create: (testResultData) => api.post('/test-results', testResultData),
  getAll: () => api.get('/test-results'),
  getById: (id) => api.get(`/test-results/${id}`),
  getByPatientId: (patientId) => api.get(`/test-results/patient/${patientId}`),
  update: (id, testResultData) => api.put(`/test-results/${id}`, testResultData),
  delete: (id) => api.delete(`/test-results/${id}`),
};

// Payment APIs
export const paymentService = {
  create: (paymentData) => api.post('/payments', paymentData),
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  getByPatientId: (patientId) => api.get(`/payments/patient/${patientId}`),
  update: (id, paymentData) => api.put(`/payments/${id}`, paymentData),
  delete: (id) => api.delete(`/payments/${id}`),
};

// Insurance APIs
export const insuranceService = {
  create: (insuranceData) => api.post('/insurance', insuranceData),
  getAll: () => api.get('/insurance'),
  getById: (id) => api.get(`/insurance/${id}`),
  getByPatientId: (patientId) => api.get(`/insurance/patient/${patientId}`),
  getCurrentByPatientId: (patientId) => api.get(`/insurance/patient/${patientId}/current`),
  update: (id, insuranceData) => api.put(`/insurance/${id}`, insuranceData),
  delete: (id) => api.delete(`/insurance/${id}`),
};

export default api;
