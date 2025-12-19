import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format, addDays, isSameDay } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { enhancedAppointmentService, doctorService } from '../services/api';
import { announceToScreenReader } from '../utils/accessibility';
import 'react-calendar/dist/Calendar.css';

function AppointmentScheduling() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentType, setAppointmentType] = useState('in-person');
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState({
    reason: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadDoctors();
    loadAppointments();
  }, [user]);

  useEffect(() => {
    if (selectedDate && selectedDoctor) {
      loadAvailableSlots();
    }
  }, [selectedDate, selectedDoctor]);

  const loadDoctors = async () => {
    try {
      const response = await doctorService.getAll();
      setDoctors(response.data || []);
    } catch (err) {
      console.error('Error loading doctors:', err);
    }
  };

  const loadAppointments = async () => {
    if (!user?.id) return;
    try {
      const response = await enhancedAppointmentService.getUpcoming(user.id);
      setAppointments(response.data || []);
    } catch (err) {
      console.error('Error loading appointments:', err);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedDoctor || !selectedDate) return;
    
    setLoadingSlots(true);
    try {
      const response = await enhancedAppointmentService.getAvailableSlots(
        selectedDoctor,
        format(selectedDate, 'yyyy-MM-dd')
      );
      setAvailableSlots(response.data || []);
    } catch (err) {
      console.error('Error loading available slots:', err);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
    setShowBookingForm(false);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setShowBookingForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDoctor || !selectedTime) {
      setErrors({ general: 'Please select a doctor and time slot' });
      return;
    }

    setLoading(true);
    try {
      await enhancedAppointmentService.create({
        patientId: user.id,
        doctorId: parseInt(selectedDoctor),
        appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
        appointmentTime: selectedTime,
        appointmentType,
        reason: formData.reason,
        notes: formData.notes,
        status: 'SCHEDULED',
      });

      announceToScreenReader('Appointment booked successfully');
      setMessage({ type: 'success', text: 'Appointment booked successfully!' });
      resetForm();
      loadAppointments();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to book appointment';
      announceToScreenReader(errorMsg);
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async (appointmentId, newDate, newTime) => {
    try {
      await enhancedAppointmentService.reschedule(appointmentId, {
        appointmentDate: format(newDate, 'yyyy-MM-dd'),
        appointmentTime: newTime,
      });
      announceToScreenReader('Appointment rescheduled successfully');
      setMessage({ type: 'success', text: 'Appointment rescheduled successfully!' });
      loadAppointments();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to reschedule appointment';
      setMessage({ type: 'error', text: errorMsg });
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await enhancedAppointmentService.cancel(appointmentId, 'Patient requested cancellation');
      announceToScreenReader('Appointment cancelled successfully');
      setMessage({ type: 'success', text: 'Appointment cancelled successfully!' });
      loadAppointments();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to cancel appointment';
      setMessage({ type: 'error', text: errorMsg });
    }
  };

  const handleSetReminder = async (appointmentId, reminderType) => {
    try {
      await enhancedAppointmentService.setReminder(appointmentId, {
        type: reminderType,
        enabled: true,
      });
      announceToScreenReader('Reminder set successfully');
      setMessage({ type: 'success', text: 'Reminder set successfully!' });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to set reminder';
      setMessage({ type: 'error', text: errorMsg });
    }
  };

  const resetForm = () => {
    setSelectedTime('');
    setShowBookingForm(false);
    setFormData({ reason: '', notes: '' });
    setErrors({});
  };

  const tileClassName = ({ date }) => {
    const hasAppointment = appointments.some(apt =>
      isSameDay(new Date(apt.appointmentDate), date)
    );
    return hasAppointment ? 'has-appointment' : '';
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00',
  ];

  return (
    <div data-testid="appointment-scheduling-page" className="appointment-scheduling-page">
      <div className="page-header">
        <h1 data-testid="appointment-scheduling-title">Schedule Appointment</h1>
        <p data-testid="appointment-scheduling-subtitle">
          Book, reschedule, or cancel your appointments
        </p>
      </div>

      {message.text && (
        <div
          className={message.type === 'success' ? 'success' : 'error'}
          data-testid={`appointment-${message.type}-message`}
          role="alert"
          aria-live="polite"
        >
          {message.text}
        </div>
      )}

      <div className="appointment-layout">
        <div className="appointment-calendar-section">
          <div className="card">
            <h2 data-testid="calendar-heading">Select Date</h2>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              minDate={new Date()}
              maxDate={addDays(new Date(), 90)}
              tileClassName={tileClassName}
              data-testid="appointment-calendar"
              aria-label="Appointment calendar"
            />
          </div>

          <div className="card" style={{ marginTop: '1rem' }}>
            <h2 data-testid="upcoming-appointments-heading">Upcoming Appointments</h2>
            {appointments.length === 0 ? (
              <p className="muted" data-testid="no-upcoming-appointments">
                No upcoming appointments
              </p>
            ) : (
              <div className="appointments-list" data-testid="upcoming-appointments-list">
                {appointments.map((apt) => (
                  <div key={apt.id} className="card" data-testid={`appointment-${apt.id}`}>
                    <h3 data-testid={`appointment-doctor-name-${apt.id}`}>
                      {doctors.find(d => d.id === apt.doctorId)?.name || 'Unknown Doctor'}
                    </h3>
                    <p data-testid={`appointment-date-time-${apt.id}`}>
                      {format(new Date(apt.appointmentDate), 'MMM dd, yyyy')} at {apt.appointmentTime}
                    </p>
                    <p data-testid={`appointment-type-${apt.id}`}>
                      Type: {apt.appointmentType || 'In-Person'}
                    </p>
                    <div className="detail-actions">
                      <button
                        type="button"
                        className="btn btn-secondary btn-compact"
                        onClick={() => handleSetReminder(apt.id, 'email')}
                        data-testid={`set-reminder-btn-${apt.id}`}
                        data-action={`set-reminder-${apt.id}`}
                        aria-label="Set reminder"
                      >
                        Set Reminder
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-compact"
                        onClick={() => handleCancel(apt.id)}
                        data-testid={`cancel-appointment-btn-${apt.id}`}
                        data-action={`cancel-appointment-${apt.id}`}
                        aria-label="Cancel appointment"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="appointment-booking-section">
          <div className="card">
            <h2 data-testid="booking-heading">Book Appointment</h2>
            
            <div className="form-group">
              <label htmlFor="doctor-select" data-testid="doctor-select-label">
                Select Doctor <span aria-label="required">*</span>
              </label>
              <select
                id="doctor-select"
                value={selectedDoctor}
                onChange={(e) => {
                  setSelectedDoctor(e.target.value);
                  setSelectedTime('');
                  setShowBookingForm(false);
                }}
                required
                aria-required="true"
                data-testid="doctor-select"
                data-action="select-doctor"
                className={errors.doctor ? 'error' : ''}
              >
                <option value="">-- Select Doctor --</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id} data-testid={`doctor-option-${doctor.id}`}>
                    {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="appointment-type" data-testid="appointment-type-label">
                Appointment Type
              </label>
              <select
                id="appointment-type"
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value)}
                data-testid="appointment-type-select"
                data-action="select-appointment-type"
              >
                <option value="in-person">In-Person</option>
                <option value="virtual">Virtual (Video)</option>
              </select>
            </div>

            {selectedDate && selectedDoctor && (
              <>
                <h3 data-testid="available-times-heading" style={{ marginTop: '1rem' }}>
                  Available Times for {format(selectedDate, 'MMM dd, yyyy')}
                </h3>
                
                {loadingSlots ? (
                  <div className="loading" data-testid="loading-slots">Loading available slots...</div>
                ) : availableSlots.length === 0 ? (
                  <p className="muted" data-testid="no-available-slots">
                    No available slots for this date. Please select another date.
                  </p>
                ) : (
                  <div className="time-slots-grid" data-testid="time-slots-grid">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={`time-slot-btn ${selectedTime === slot ? 'selected' : ''}`}
                        onClick={() => handleTimeSelect(slot)}
                        data-testid={`time-slot-${slot}`}
                        data-action={`select-time-${slot}`}
                        aria-label={`Select ${slot}`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {showBookingForm && selectedTime && (
              <form onSubmit={handleSubmit} data-testid="booking-form" style={{ marginTop: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="reason" data-testid="reason-label">
                    Reason for Visit
                  </label>
                  <input
                    type="text"
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Brief reason for appointment"
                    data-testid="reason-input"
                    data-field="reason"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notes" data-testid="notes-label">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="3"
                    placeholder="Any additional information..."
                    data-testid="notes-input"
                    data-field="notes"
                  />
                </div>

                {errors.general && (
                  <div className="error" data-testid="booking-error" role="alert">
                    {errors.general}
                  </div>
                )}

                <div className="actions-row">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    data-testid="book-appointment-btn"
                    data-action="book-appointment"
                    data-specialty={doctors.find(d => d.id === parseInt(selectedDoctor))?.specialization}
                    aria-label="Book appointment"
                  >
                    {loading ? 'Booking...' : 'Book Appointment'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={resetForm}
                    data-testid="cancel-booking-btn"
                    aria-label="Cancel booking"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentScheduling;

