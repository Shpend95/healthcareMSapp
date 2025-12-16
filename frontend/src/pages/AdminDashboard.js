import React from 'react';
import { useAuth } from '../context/AuthContext';

function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div data-testid="admin-dashboard-page">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user?.name} (Admin)</p>
      </div>
      <div className="dashboard-grid">
        <div className="card">
          <h3>User Management</h3>
          <p>Manage users, roles, and access (placeholder for future functionality).</p>
        </div>
        <div className="card">
          <h3>System Settings</h3>
          <p>Configure system-wide settings and security policies.</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;


