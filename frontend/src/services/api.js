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

export default api;
