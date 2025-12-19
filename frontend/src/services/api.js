import axios from 'axios';
import { AUTH_KEY } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:8081/api';

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
  uploadCard: (patientId, formData) => api.post(`/insurance/patient/${patientId}/upload-card`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Enhanced Appointment APIs
export const enhancedAppointmentService = {
  ...appointmentService,
  getAvailableSlots: (doctorId, date) => api.get(`/appointments/available-slots`, { params: { doctorId, date } }),
  reschedule: (id, appointmentData) => api.put(`/appointments/${id}/reschedule`, appointmentData),
  cancel: (id, reason) => api.post(`/appointments/${id}/cancel`, { reason }),
  getUpcoming: (patientId) => api.get(`/appointments/patient/${patientId}/upcoming`),
  getPast: (patientId) => api.get(`/appointments/patient/${patientId}/past`),
  setReminder: (id, reminderData) => api.post(`/appointments/${id}/reminder`, reminderData),
};

// Health Records APIs
export const healthRecordService = {
  getMedicalHistory: (patientId) => api.get(`/health-records/patient/${patientId}/history`),
  getImmunizations: (patientId) => api.get(`/health-records/patient/${patientId}/immunizations`),
  getAllergies: (patientId) => api.get(`/health-records/patient/${patientId}/allergies`),
  addAllergy: (patientId, allergyData) => api.post(`/health-records/patient/${patientId}/allergies`, allergyData),
  updateAllergy: (patientId, allergyId, allergyData) => api.put(`/health-records/patient/${patientId}/allergies/${allergyId}`, allergyData),
  deleteAllergy: (patientId, allergyId) => api.delete(`/health-records/patient/${patientId}/allergies/${allergyId}`),
  getLabResults: (patientId) => api.get(`/health-records/patient/${patientId}/lab-results`),
  getLabResultTrends: (patientId, testType) => api.get(`/health-records/patient/${patientId}/lab-trends`, { params: { testType } }),
};

// Medication APIs
export const medicationService = {
  getCurrentMedications: (patientId) => api.get(`/medications/patient/${patientId}/current`),
  addMedication: (patientId, medicationData) => api.post(`/medications/patient/${patientId}`, medicationData),
  updateMedication: (patientId, medicationId, medicationData) => api.put(`/medications/patient/${patientId}/${medicationId}`, medicationData),
  deleteMedication: (patientId, medicationId) => api.delete(`/medications/patient/${patientId}/${medicationId}`),
  requestRefill: (patientId, medicationId) => api.post(`/medications/patient/${patientId}/${medicationId}/refill`),
  getRefillHistory: (patientId) => api.get(`/medications/patient/${patientId}/refills`),
  checkInteractions: (medicationIds) => api.post('/medications/check-interactions', { medicationIds }),
  setReminder: (patientId, medicationId, reminderData) => api.post(`/medications/patient/${patientId}/${medicationId}/reminder`, reminderData),
  getAdherence: (patientId, medicationId) => api.get(`/medications/patient/${patientId}/${medicationId}/adherence`),
};

// Telehealth APIs
export const telehealthService = {
  createVisit: (visitData) => api.post('/telehealth/visits', visitData),
  getVisit: (visitId) => api.get(`/telehealth/visits/${visitId}`),
  getUpcomingVisits: (patientId) => api.get(`/telehealth/visits/patient/${patientId}/upcoming`),
  joinVisit: (visitId) => api.post(`/telehealth/visits/${visitId}/join`),
  getVisitToken: (visitId) => api.get(`/telehealth/visits/${visitId}/token`),
  endVisit: (visitId) => api.post(`/telehealth/visits/${visitId}/end`),
  getVisitSummary: (visitId) => api.get(`/telehealth/visits/${visitId}/summary`),
  getVisitRecording: (visitId) => api.get(`/telehealth/visits/${visitId}/recording`),
  getWaitingRoomPosition: (visitId) => api.get(`/telehealth/visits/${visitId}/waiting-room`),
};

// Billing APIs
export const billingService = {
  getBills: (patientId) => api.get(`/billing/patient/${patientId}/bills`),
  getBill: (billId) => api.get(`/billing/bills/${billId}`),
  getPaymentHistory: (patientId) => api.get(`/billing/patient/${patientId}/payments`),
  createPaymentPlan: (patientId, planData) => api.post(`/billing/patient/${patientId}/payment-plans`, planData),
  getPaymentPlans: (patientId) => api.get(`/billing/patient/${patientId}/payment-plans`),
  getClaims: (patientId) => api.get(`/billing/patient/${patientId}/claims`),
  getClaim: (claimId) => api.get(`/billing/claims/${claimId}`),
  payBill: (billId, paymentData) => api.post(`/billing/bills/${billId}/pay`, paymentData),
};

// Patient Profile APIs
export const profileService = {
  getProfile: (patientId) => api.get(`/profile/patient/${patientId}`),
  updateProfile: (patientId, profileData) => api.put(`/profile/patient/${patientId}`, profileData),
  updatePersonalInfo: (patientId, personalData) => api.put(`/profile/patient/${patientId}/personal-info`, personalData),
  updateAddress: (patientId, addressData) => api.put(`/profile/patient/${patientId}/address`, addressData),
  addAddress: (patientId, addressData) => api.post(`/profile/patient/${patientId}/addresses`, addressData),
  deleteAddress: (patientId, addressId) => api.delete(`/profile/patient/${patientId}/addresses/${addressId}`),
  uploadProfilePicture: (patientId, formData) => api.post(`/profile/patient/${patientId}/picture`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProfilePicture: (patientId) => api.delete(`/profile/patient/${patientId}/picture`),
  addPaymentMethod: (patientId, paymentData) => api.post(`/profile/patient/${patientId}/payment-methods`, paymentData),
  getPaymentMethods: (patientId) => api.get(`/profile/patient/${patientId}/payment-methods`),
  updatePaymentMethod: (patientId, methodId, paymentData) => api.put(`/profile/patient/${patientId}/payment-methods/${methodId}`, paymentData),
  deletePaymentMethod: (patientId, methodId) => api.delete(`/profile/patient/${patientId}/payment-methods/${methodId}`),
  setDefaultPaymentMethod: (patientId, methodId) => api.post(`/profile/patient/${patientId}/payment-methods/${methodId}/set-default`),
  addEmergencyContact: (patientId, contactData) => api.post(`/profile/patient/${patientId}/emergency-contacts`, contactData),
  getEmergencyContacts: (patientId) => api.get(`/profile/patient/${patientId}/emergency-contacts`),
  updateEmergencyContact: (patientId, contactId, contactData) => api.put(`/profile/patient/${patientId}/emergency-contacts/${contactId}`, contactData),
  deleteEmergencyContact: (patientId, contactId) => api.delete(`/profile/patient/${patientId}/emergency-contacts/${contactId}`),
  updatePreferences: (patientId, preferences) => api.put(`/profile/patient/${patientId}/preferences`, preferences),
  getPreferences: (patientId) => api.get(`/profile/patient/${patientId}/preferences`),
};

// Family Account APIs
export const familyAccountService = {
  getFamilyMembers: (patientId) => api.get(`/family/patient/${patientId}/members`),
  addFamilyMember: (patientId, memberData) => api.post(`/family/patient/${patientId}/members`, memberData),
  updateFamilyMember: (patientId, memberId, memberData) => api.put(`/family/patient/${patientId}/members/${memberId}`, memberData),
  deleteFamilyMember: (patientId, memberId) => api.delete(`/family/patient/${patientId}/members/${memberId}`),
  requestProxyAccess: (patientId, proxyData) => api.post(`/family/patient/${patientId}/proxy-access`, proxyData),
  getProxyAccess: (patientId) => api.get(`/family/patient/${patientId}/proxy-access`),
  switchProfile: (patientId, targetPatientId) => api.post(`/family/patient/${patientId}/switch-profile`, { targetPatientId }),
};

// Health Tracking APIs
export const healthTrackingService = {
  connectDevice: (patientId, deviceData) => api.post(`/health-tracking/patient/${patientId}/devices`, deviceData),
  getDevices: (patientId) => api.get(`/health-tracking/patient/${patientId}/devices`),
  disconnectDevice: (patientId, deviceId) => api.delete(`/health-tracking/patient/${patientId}/devices/${deviceId}`),
  syncDevice: (patientId, deviceId) => api.post(`/health-tracking/patient/${patientId}/devices/${deviceId}/sync`),
  getVitalSigns: (patientId, type, dateRange) => api.get(`/health-tracking/patient/${patientId}/vitals`, { params: { type, ...dateRange } }),
  addVitalSign: (patientId, vitalData) => api.post(`/health-tracking/patient/${patientId}/vitals`, vitalData),
  getActivity: (patientId, dateRange) => api.get(`/health-tracking/patient/${patientId}/activity`, { params: dateRange }),
  setWellnessGoals: (patientId, goals) => api.post(`/health-tracking/patient/${patientId}/goals`, goals),
  getWellnessGoals: (patientId) => api.get(`/health-tracking/patient/${patientId}/goals`),
  shareWithProvider: (patientId, providerId, dataTypes) => api.post(`/health-tracking/patient/${patientId}/share`, { providerId, dataTypes }),
};

// Pharmacy APIs
export const pharmacyService = {
  searchPharmacies: (query, location) => api.get('/pharmacies/search', { params: { query, ...location } }),
  getNearbyPharmacies: (latitude, longitude, radius) => api.get('/pharmacies/nearby', { params: { latitude, longitude, radius } }),
  setPreferredPharmacy: (patientId, pharmacyId) => api.post(`/profile/patient/${patientId}/preferred-pharmacy`, { pharmacyId }),
  getPreferredPharmacy: (patientId) => api.get(`/profile/patient/${patientId}/preferred-pharmacy`),
};

export default api;
