import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { appointmentService, patientService, doctorService } from '../services/api';

function PatientDashboard() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [showUpdateForm, setShowUpdateForm] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [patientId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [patientResponse, appointmentsResponse, doctorsResponse] = await Promise.all([
        patientService.getById(patientId),
        appointmentService.getByPatientId(patientId),
        doctorService.getAll()
      ]);
      setPatient(patientResponse.data);
      setAppointments(appointmentsResponse.data);
      setDoctors(doctorsResponse.data);
      setError('');
    } catch (err) {
      setError('Failed to load dashboard data. Please check if the patient ID is valid.');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? doctor.name : 'Unknown Doctor';
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await appointmentService.delete(appointmentId);
      setActionMessage('Appointment cancelled successfully');
      loadDashboardData();
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      setActionMessage('Failed to cancel appointment. Please try again.');
      console.error('Error cancelling appointment:', err);
    }
  };

  const handleUpdateAppointment = async (appointmentId, updateData) => {
    try {
      await appointmentService.update(appointmentId, updateData);
      setActionMessage('Appointment updated successfully');
      setShowUpdateForm(null);
      loadDashboardData();
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      setActionMessage('Failed to update appointment. Please try again.');
      console.error('Error updating appointment:', err);
    }
  };

  if (loading) {
    return (
      <div data-testid="patient-dashboard-page">
        <div className="loading" data-testid="dashboard-loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="patient-dashboard-page">
        <div className="error" data-testid="dashboard-error">{error}</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div data-testid="patient-dashboard-page">
        <div className="error" data-testid="dashboard-error">Patient not found</div>
      </div>
    );
  }

  return (
    <div data-testid="patient-dashboard-page">
      <div className="page-header">
        <h1 data-testid="dashboard-title">Patient Dashboard</h1>
        <p data-testid="dashboard-subtitle">Welcome, {patient.name}</p>
      </div>

      {actionMessage && (
        <div className={actionMessage.includes('Failed') ? 'error' : 'success'} data-testid="dashboard-message">
          {actionMessage}
        </div>
      )}

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 data-testid="patient-info-title">Patient Information</h2>
          <a href="/profile" className="btn btn-primary" data-testid="view-profile-link">
            View/Edit Profile
          </a>
        </div>
        <p data-testid="patient-info-name"><strong>Name:</strong> {patient.name}</p>
        <p data-testid="patient-info-email"><strong>Email:</strong> {patient.email}</p>
        <p data-testid="patient-info-phone"><strong>Phone:</strong> {patient.phone}</p>
        <p data-testid="patient-info-dob"><strong>Date of Birth:</strong> {patient.dateOfBirth}</p>
        <p data-testid="patient-info-address"><strong>Address:</strong> {patient.address}</p>
      </div>

      <div>
        <h2 data-testid="appointments-title" style={{ marginBottom: '1rem' }}>
          Your Appointments ({appointments.length})
        </h2>

        {appointments.length === 0 ? (
          <div data-testid="no-appointments-message" className="card">
            <p>You have no appointments scheduled.</p>
          </div>
        ) : (
          <div className="appointments-list" data-testid="appointments-list">
            {appointments.map(appointment => (
              <div key={appointment.id} className="card" data-testid={`appointment-card-${appointment.id}`}>
                {showUpdateForm === appointment.id ? (
                  <UpdateAppointmentForm
                    appointment={appointment}
                    doctors={doctors}
                    onUpdate={handleUpdateAppointment}
                    onCancel={() => setShowUpdateForm(null)}
                  />
                ) : (
                  <>
                    <h3 data-testid={`appointment-doctor-${appointment.id}`}>
                      Doctor: {getDoctorName(appointment.doctorId)}
                    </h3>
                    <p data-testid={`appointment-date-${appointment.id}`}>
                      <strong>Date:</strong> {appointment.appointmentDate}
                    </p>
                    <p data-testid={`appointment-time-${appointment.id}`}>
                      <strong>Time:</strong> {appointment.appointmentTime}
                    </p>
                    <p data-testid={`appointment-status-${appointment.id}`}>
                      <strong>Status:</strong> {appointment.status}
                    </p>
                    {appointment.notes && (
                      <p data-testid={`appointment-notes-${appointment.id}`}>
                        <strong>Notes:</strong> {appointment.notes}
                      </p>
                    )}
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setShowUpdateForm(appointment.id)}
                        data-testid={`update-appointment-btn-${appointment.id}`}
                        id={`update-appointment-btn-${appointment.id}`}
                      >
                        Update
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleCancelAppointment(appointment.id)}
                        data-testid={`cancel-appointment-btn-${appointment.id}`}
                        id={`cancel-appointment-btn-${appointment.id}`}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UpdateAppointmentForm({ appointment, doctors, onUpdate, onCancel }) {
  const [formData, setFormData] = useState({
    doctorId: appointment.doctorId.toString(),
    appointmentDate: appointment.appointmentDate,
    appointmentTime: appointment.appointmentTime,
    status: appointment.status,
    notes: appointment.notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(appointment.id, {
      ...formData,
      doctorId: parseInt(formData.doctorId)
    });
  };

  return (
    <form onSubmit={handleSubmit} data-testid={`update-form-${appointment.id}`}>
      <div className="form-group">
        <label>Doctor</label>
        <select
          value={formData.doctorId}
          onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
          data-testid={`update-doctor-select-${appointment.id}`}
        >
          {doctors.map(doctor => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name} - {doctor.specialization}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Date</label>
        <input
          type="date"
          value={formData.appointmentDate}
          onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
          data-testid={`update-date-input-${appointment.id}`}
        />
      </div>
      <div className="form-group">
        <label>Time</label>
        <input
          type="time"
          value={formData.appointmentTime}
          onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
          data-testid={`update-time-input-${appointment.id}`}
        />
      </div>
      <div className="form-group">
        <label>Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          data-testid={`update-status-select-${appointment.id}`}
        >
          <option value="SCHEDULED">SCHEDULED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>
      <div className="form-group">
        <label>Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows="3"
          data-testid={`update-notes-input-${appointment.id}`}
        />
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button type="submit" className="btn btn-primary" data-testid={`save-update-btn-${appointment.id}`}>
          Save Changes
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel} data-testid={`cancel-update-btn-${appointment.id}`}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default PatientDashboard;
