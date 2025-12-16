import React from 'react';
import { useAuth } from '../context/AuthContext';

function DoctorDashboard() {
  const { user } = useAuth();

  return (
    <div data-testid="doctor-dashboard-page">
      <div className="page-header">
        <h1>Doctor Dashboard</h1>
        <p>Welcome, {user?.name} (Doctor)</p>
      </div>
      <div className="card">
        <h3>Assigned Patients</h3>
        <p>View and manage your patients, medical records, and appointments (placeholder).</p>
      </div>
    </div>
  );
}

export default DoctorDashboard;


