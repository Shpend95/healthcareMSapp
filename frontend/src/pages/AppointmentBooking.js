import React, { useState, useEffect } from 'react';
import { appointmentService, doctorService, patientService } from '../services/api';

function AppointmentBooking() {
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: ''
  });
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      console.log('[AppointmentBooking] Loading doctors and patients data...');
      const [doctorsResponse, patientsResponse] = await Promise.all([
        doctorService.getAll(),
        patientService.getAll()
      ]);
      console.log('[AppointmentBooking] Doctors loaded:', doctorsResponse.data);
      console.log('[AppointmentBooking] Patients loaded:', patientsResponse.data);
      
      if (!doctorsResponse.data || doctorsResponse.data.length === 0) {
        console.warn('[AppointmentBooking] No doctors found in response');
      }
      if (!patientsResponse.data || patientsResponse.data.length === 0) {
        console.warn('[AppointmentBooking] No patients found in response');
      }
      
      setDoctors(doctorsResponse.data || []);
      setPatients(patientsResponse.data || []);
    } catch (err) {
      let errorMessage = 'Failed to load data. Please try again.';
      
      if (err.response) {
        // Server responded with error
        errorMessage = `Failed to load data: ${err.response.status} ${err.response.statusText}`;
        if (err.response.data?.message) {
          errorMessage += ` - ${err.response.data.message}`;
        }
        console.error('[AppointmentBooking] Error response:', {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data
        });
      } else if (err.request) {
        // Request made but no response
        errorMessage = 'Failed to connect to backend server. Please ensure the backend is running on http://localhost:8081';
        console.error('[AppointmentBooking] No response from server:', err.request);
      } else {
        // Error setting up request
        errorMessage = `Error: ${err.message}`;
        console.error('[AppointmentBooking] Request setup error:', err);
      }
      
      setSubmitError(errorMessage);
      console.error('[AppointmentBooking] Full error details:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.patientId) {
      newErrors.patientId = 'Please select a patient';
    }

    if (!formData.doctorId) {
      newErrors.doctorId = 'Please select a doctor';
    }

    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'Appointment date is required';
    } else {
      const selectedDate = new Date(formData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.appointmentDate = 'Appointment date cannot be in the past';
      }
    }

    if (!formData.appointmentTime) {
      newErrors.appointmentTime = 'Appointment time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const appointmentData = {
        patientId: parseInt(formData.patientId),
        doctorId: parseInt(formData.doctorId),
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        notes: formData.notes || null,
        status: 'SCHEDULED'
      };

      const response = await appointmentService.create(appointmentData);
      
      setSuccessMessage(`Appointment booked successfully! Appointment ID: ${response.data.id}`);
      
      // Clear form
      setFormData({
        patientId: '',
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        notes: ''
      });

    } catch (error) {
      if (error.response?.data?.message) {
        setSubmitError(error.response.data.message);
      } else {
        setSubmitError('Failed to book appointment. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div data-testid="appointment-booking-page">
        <div className="loading" data-testid="appointment-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div data-testid="appointment-booking-page">
      <div className="page-header">
        <h1 data-testid="appointment-title">Book an Appointment</h1>
        <p data-testid="appointment-subtitle">Schedule your visit with our doctors</p>
      </div>

      <div className="form-container">
        {submitError && (
          <div className="error" data-testid="appointment-error">
            {submitError}
          </div>
        )}
        {successMessage && (
          <div className="success" data-testid="appointment-success">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} data-testid="appointment-booking-form">
          <div className="form-group">
            <label htmlFor="appointment-patient">Select Patient *</label>
            <select
              id="appointment-patient"
              name="patientId"
              data-testid="appointment-patient-select"
              value={formData.patientId}
              onChange={handleChange}
              className={errors.patientId ? 'error' : ''}
            >
              <option value="">-- Select Patient --</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id} data-testid={`patient-option-${patient.id}`}>
                  {patient.name} ({patient.email})
                </option>
              ))}
            </select>
            {errors.patientId && (
              <span className="error-message" data-testid="appointment-patient-error">
                {errors.patientId}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="appointment-doctor">Select Doctor *</label>
            <select
              id="appointment-doctor"
              name="doctorId"
              data-testid="appointment-doctor-select"
              value={formData.doctorId}
              onChange={handleChange}
              className={errors.doctorId ? 'error' : ''}
            >
              <option value="">-- Select Doctor --</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id} data-testid={`doctor-option-${doctor.id}`}>
                  {doctor.name} - {doctor.specialization}
                </option>
              ))}
            </select>
            {errors.doctorId && (
              <span className="error-message" data-testid="appointment-doctor-error">
                {errors.doctorId}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="appointment-date">Appointment Date *</label>
            <input
              type="date"
              id="appointment-date"
              name="appointmentDate"
              data-testid="appointment-date-input"
              value={formData.appointmentDate}
              onChange={handleChange}
              className={errors.appointmentDate ? 'error' : ''}
            />
            {errors.appointmentDate && (
              <span className="error-message" data-testid="appointment-date-error">
                {errors.appointmentDate}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="appointment-time">Appointment Time *</label>
            <input
              type="time"
              id="appointment-time"
              name="appointmentTime"
              data-testid="appointment-time-input"
              value={formData.appointmentTime}
              onChange={handleChange}
              className={errors.appointmentTime ? 'error' : ''}
            />
            {errors.appointmentTime && (
              <span className="error-message" data-testid="appointment-time-error">
                {errors.appointmentTime}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="appointment-notes">Notes (Optional)</label>
            <textarea
              id="appointment-notes"
              name="notes"
              rows="4"
              data-testid="appointment-notes-input"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional information or symptoms..."
            ></textarea>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            data-testid="appointment-submit-btn"
            id="appointment-submit-btn"
            disabled={loading}
          >
            {loading ? 'Booking...' : 'Book Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AppointmentBooking;
