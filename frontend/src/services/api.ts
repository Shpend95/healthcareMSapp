import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { AUTH_KEY } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:8080/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically if present
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const stored =
      window.localStorage.getItem(AUTH_KEY) || window.sessionStorage.getItem(AUTH_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const token = parsed.token;
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        // ignore malformed auth data
      }
    }
  }
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

// Handle 401/403 errors - redirect to login
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    if (response.data) {
      console.log('API Response Data:', response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      console.error(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status: ${status}`, error.response.data);
      if (status === 401 || status === 403) {
        // Clear auth data and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem(AUTH_KEY);
          sessionStorage.removeItem(AUTH_KEY);
          // Only redirect if not already on login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
    } else {
      console.error('API Error (no response):', error.message);
    }
    return Promise.reject(error);
  }
);

// Patient APIs
export const patientService = {
  register: (patientData: any) => api.post('/patients', patientData),
  getAll: () => api.get('/patients'),
  getById: (id: number) => api.get(`/patients/${id}`),
};

// Doctor APIs
export const doctorService = {
  getAll: () => api.get('/doctors'),
  getById: (id: number) => api.get(`/doctors/${id}`),
  getBySpecialization: (specialization: string) => api.get(`/doctors/specialization/${specialization}`),
};

// Appointment APIs
export const appointmentService = {
  create: (appointmentData: any) => api.post('/appointments', appointmentData),
  getAll: () => api.get('/appointments'),
  getById: (id: number) => api.get(`/appointments/${id}`),
  getByPatientId: (patientId: number) => api.get(`/appointments/patient/${patientId}`),
  update: (id: number, appointmentData: any) => api.put(`/appointments/${id}`, appointmentData),
  delete: (id: number) => api.delete(`/appointments/${id}`),
};

// Test Results APIs
export const testResultService = {
  create: (testResultData: any) => api.post('/test-results', testResultData),
  getAll: () => api.get('/test-results'),
  getById: (id: number) => api.get(`/test-results/${id}`),
  getByPatientId: (patientId: number) => api.get(`/test-results/patient/${patientId}`),
  update: (id: number, testResultData: any) => api.put(`/test-results/${id}`, testResultData),
  delete: (id: number) => api.delete(`/test-results/${id}`),
};

// Payment APIs
export const paymentService = {
  create: (paymentData: any) => api.post('/payments', paymentData),
  getAll: () => api.get('/payments'),
  getById: (id: number) => api.get(`/payments/${id}`),
  getByPatientId: (patientId: number) => api.get(`/payments/patient/${patientId}`),
  update: (id: number, paymentData: any) => api.put(`/payments/${id}`, paymentData),
  delete: (id: number) => api.delete(`/payments/${id}`),
};

// Insurance APIs
export const insuranceService = {
  create: (insuranceData: any) => api.post('/insurance', insuranceData),
  getAll: () => api.get('/insurance'),
  getById: (id: number) => api.get(`/insurance/${id}`),
  getByPatientId: (patientId: number) => api.get(`/insurance/patient/${patientId}`),
  getCurrentByPatientId: (patientId: number) => api.get(`/insurance/patient/${patientId}/current`),
  update: (id: number, insuranceData: any) => api.put(`/insurance/${id}`, insuranceData),
  delete: (id: number) => api.delete(`/insurance/${id}`),
  uploadCard: (patientId: number, formData: FormData) => api.post(`/insurance/patient/${patientId}/upload-card`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Enhanced Appointment APIs
export const enhancedAppointmentService = {
  ...appointmentService,
  getAvailableSlots: (doctorId: number, date: string) => api.get(`/appointments/available-slots`, { params: { doctorId, date } }),
  reschedule: (id: number, appointmentData: any) => api.put(`/appointments/${id}/reschedule`, appointmentData),
  cancel: (id: number, reason: string) => api.post(`/appointments/${id}/cancel`, { reason }),
  getUpcoming: (patientId: number) => api.get(`/appointments/patient/${patientId}/upcoming`),
  getPast: (patientId: number) => api.get(`/appointments/patient/${patientId}/past`),
  setReminder: (id: number, reminderData: any) => api.post(`/appointments/${id}/reminder`, reminderData),
};

// Health Records APIs
export const healthRecordService = {
  getMedicalHistory: (patientId: number) => api.get(`/health-records/patient/${patientId}/history`),
  getImmunizations: (patientId: number) => api.get(`/health-records/patient/${patientId}/immunizations`),
  getAllergies: (patientId: number) => api.get(`/health-records/patient/${patientId}/allergies`),
  addAllergy: (patientId: number, allergyData: any) => api.post(`/health-records/patient/${patientId}/allergies`, allergyData),
  updateAllergy: (patientId: number, allergyId: number, allergyData: any) => api.put(`/health-records/patient/${patientId}/allergies/${allergyId}`, allergyData),
  deleteAllergy: (patientId: number, allergyId: number) => api.delete(`/health-records/patient/${patientId}/allergies/${allergyId}`),
  getLabResults: (patientId: number) => api.get(`/health-records/patient/${patientId}/lab-results`),
  getLabResultTrends: (patientId: number, testType: string) => api.get(`/health-records/patient/${patientId}/lab-trends`, { params: { testType } }),
};

// Medication APIs
export const medicationService = {
  getCurrentMedications: (patientId: number) => api.get(`/medications/patient/${patientId}/current`),
  addMedication: (patientId: number, medicationData: any) => api.post(`/medications/patient/${patientId}`, medicationData),
  updateMedication: (patientId: number, medicationId: number, medicationData: any) => api.put(`/medications/patient/${patientId}/${medicationId}`, medicationData),
  deleteMedication: (patientId: number, medicationId: number) => api.delete(`/medications/patient/${patientId}/${medicationId}`),
  requestRefill: (patientId: number, medicationId: number) => api.post(`/medications/patient/${patientId}/${medicationId}/refill`),
  getRefillHistory: (patientId: number) => api.get(`/medications/patient/${patientId}/refills`),
  checkInteractions: (medicationIds: number[]) => api.post('/medications/check-interactions', { medicationIds }),
  setReminder: (patientId: number, medicationId: number, reminderData: any) => api.post(`/medications/patient/${patientId}/${medicationId}/reminder`, reminderData),
  getAdherence: (patientId: number, medicationId: number) => api.get(`/medications/patient/${patientId}/${medicationId}/adherence`),
};

// Telehealth APIs
export const telehealthService = {
  createVisit: (visitData: any) => api.post('/telehealth/visits', visitData),
  getVisit: (visitId: number) => api.get(`/telehealth/visits/${visitId}`),
  getUpcomingVisits: (patientId: number) => api.get(`/telehealth/visits/patient/${patientId}/upcoming`),
  joinVisit: (visitId: number) => api.post(`/telehealth/visits/${visitId}/join`),
  getVisitToken: (visitId: number) => api.get(`/telehealth/visits/${visitId}/token`),
  endVisit: (visitId: number) => api.post(`/telehealth/visits/${visitId}/end`),
  getVisitSummary: (visitId: number) => api.get(`/telehealth/visits/${visitId}/summary`),
  getVisitRecording: (visitId: number) => api.get(`/telehealth/visits/${visitId}/recording`),
  getWaitingRoomPosition: (visitId: number) => api.get(`/telehealth/visits/${visitId}/waiting-room`),
};

// Billing APIs
export const billingService = {
  getBills: (patientId: number) => api.get(`/billing/patient/${patientId}/bills`),
  getBill: (billId: number) => api.get(`/billing/bills/${billId}`),
  getPaymentHistory: (patientId: number) => api.get(`/billing/patient/${patientId}/payments`),
  createPaymentPlan: (patientId: number, planData: any) => api.post(`/billing/patient/${patientId}/payment-plans`, planData),
  getPaymentPlans: (patientId: number) => api.get(`/billing/patient/${patientId}/payment-plans`),
  getClaims: (patientId: number) => api.get(`/billing/patient/${patientId}/claims`),
  getClaim: (claimId: number) => api.get(`/billing/claims/${claimId}`),
  payBill: (billId: number, paymentData: any) => api.post(`/billing/bills/${billId}/pay`, paymentData),
};

// Patient Profile APIs
export const profileService = {
  getProfile: (patientId: number) => api.get(`/profile/patient/${patientId}`),
  updateProfile: (patientId: number, profileData: any) => api.put(`/profile/patient/${patientId}`, profileData),
  updatePersonalInfo: (patientId: number, personalData: any) => api.put(`/profile/patient/${patientId}/personal-info`, personalData),
  updateAddress: (patientId: number, addressData: any) => api.put(`/profile/patient/${patientId}/address`, addressData),
  addAddress: (patientId: number, addressData: any) => api.post(`/profile/patient/${patientId}/addresses`, addressData),
  deleteAddress: (patientId: number, addressId: number) => api.delete(`/profile/patient/${patientId}/addresses/${addressId}`),
  uploadProfilePicture: (patientId: number, formData: FormData) => api.post(`/profile/patient/${patientId}/picture`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProfilePicture: (patientId: number) => api.delete(`/profile/patient/${patientId}/picture`),
  addPaymentMethod: (patientId: number, paymentData: any) => api.post(`/profile/patient/${patientId}/payment-methods`, paymentData),
  getPaymentMethods: (patientId: number) => api.get(`/profile/patient/${patientId}/payment-methods`),
  updatePaymentMethod: (patientId: number, methodId: number, paymentData: any) => api.put(`/profile/patient/${patientId}/payment-methods/${methodId}`, paymentData),
  deletePaymentMethod: (patientId: number, methodId: number) => api.delete(`/profile/patient/${patientId}/payment-methods/${methodId}`),
  setDefaultPaymentMethod: (patientId: number, methodId: number) => api.post(`/profile/patient/${patientId}/payment-methods/${methodId}/set-default`),
  addEmergencyContact: (patientId: number, contactData: any) => api.post(`/profile/patient/${patientId}/emergency-contacts`, contactData),
  getEmergencyContacts: (patientId: number) => api.get(`/profile/patient/${patientId}/emergency-contacts`),
  updateEmergencyContact: (patientId: number, contactId: number, contactData: any) => api.put(`/profile/patient/${patientId}/emergency-contacts/${contactId}`, contactData),
  deleteEmergencyContact: (patientId: number, contactId: number) => api.delete(`/profile/patient/${patientId}/emergency-contacts/${contactId}`),
  updatePreferences: (patientId: number, preferences: any) => api.put(`/profile/patient/${patientId}/preferences`, preferences),
  getPreferences: (patientId: number) => api.get(`/profile/patient/${patientId}/preferences`),
};

// Family Account APIs
export const familyAccountService = {
  getFamilyMembers: (patientId: number) => api.get(`/family/patient/${patientId}/members`),
  addFamilyMember: (patientId: number, memberData: any) => api.post(`/family/patient/${patientId}/members`, memberData),
  updateFamilyMember: (patientId: number, memberId: number, memberData: any) => api.put(`/family/patient/${patientId}/members/${memberId}`, memberData),
  deleteFamilyMember: (patientId: number, memberId: number) => api.delete(`/family/patient/${patientId}/members/${memberId}`),
  requestProxyAccess: (patientId: number, proxyData: any) => api.post(`/family/patient/${patientId}/proxy-access`, proxyData),
  getProxyAccess: (patientId: number) => api.get(`/family/patient/${patientId}/proxy-access`),
  switchProfile: (patientId: number, targetPatientId: number) => api.post(`/family/patient/${patientId}/switch-profile`, { targetPatientId }),
};

// Health Tracking APIs
export const healthTrackingService = {
  connectDevice: (patientId: number, deviceData: any) => api.post(`/health-tracking/patient/${patientId}/devices`, deviceData),
  getDevices: (patientId: number) => api.get(`/health-tracking/patient/${patientId}/devices`),
  disconnectDevice: (patientId: number, deviceId: number) => api.delete(`/health-tracking/patient/${patientId}/devices/${deviceId}`),
  syncDevice: (patientId: number, deviceId: number) => api.post(`/health-tracking/patient/${patientId}/devices/${deviceId}/sync`),
  getVitalSigns: (patientId: number, type: string, dateRange: any) => api.get(`/health-tracking/patient/${patientId}/vitals`, { params: { type, ...dateRange } }),
  addVitalSign: (patientId: number, vitalData: any) => api.post(`/health-tracking/patient/${patientId}/vitals`, vitalData),
  getActivity: (patientId: number, dateRange: any) => api.get(`/health-tracking/patient/${patientId}/activity`, { params: dateRange }),
  setWellnessGoals: (patientId: number, goals: any) => api.post(`/health-tracking/patient/${patientId}/goals`, goals),
  getWellnessGoals: (patientId: number) => api.get(`/health-tracking/patient/${patientId}/goals`),
  shareWithProvider: (patientId: number, providerId: number, dataTypes: string[]) => api.post(`/health-tracking/patient/${patientId}/share`, { providerId, dataTypes }),
};

// Pharmacy APIs
export const pharmacyService = {
  searchPharmacies: (query: string, location: any) => api.get('/pharmacies/search', { params: { query, ...location } }),
  getNearbyPharmacies: (latitude: number, longitude: number, radius: number) => api.get('/pharmacies/nearby', { params: { latitude, longitude, radius } }),
  setPreferredPharmacy: (patientId: number, pharmacyId: number) => api.post(`/profile/patient/${patientId}/preferred-pharmacy`, { pharmacyId }),
  getPreferredPharmacy: (patientId: number) => api.get(`/profile/patient/${patientId}/preferred-pharmacy`),
};

export default api;
