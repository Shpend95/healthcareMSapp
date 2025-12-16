import React from 'react';
import { useAuth } from '../context/AuthContext';

function NurseDashboard() {
  const { user } = useAuth();

  return (
    <div data-testid="nurse-dashboard-page">
      <div className="page-header">
        <h1>Nurse Dashboard</h1>
        <p>Welcome, {user?.name} (Nurse)</p>
      </div>
      <div className="card">
        <h3>Patient Vitals & Notes</h3>
        <p>Assist doctors and update patient notes (placeholder for future implementation).</p>
      </div>
    </div>
  );
}

export default NurseDashboard;


