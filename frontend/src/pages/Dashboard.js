import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();

  return (
    <div data-testid="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name || 'Guest'}</p>
      </div>

      <div className="dashboard-grid">
        <div className="card highlight">
          <h3>Quick Actions</h3>
          <ul className="quick-actions">
            <li>
              <Link to="/profile" className="link" data-testid="quick-edit-profile">
                Edit Profile
              </Link>
            </li>
            <li>
              <Link to="/test-results" className="link" data-testid="quick-test-results">
                View test results
              </Link>
            </li>
            <li>
              <Link to="/insurance" className="link" data-testid="quick-insurance">
                Manage insurance
              </Link>
            </li>
            <li>
              <Link to="/payment" className="link" data-testid="quick-payments">
                Review payments
              </Link>
            </li>
          </ul>
        </div>

        <div className="card">
          <h3>Account</h3>
          <p>
            <strong>Name:</strong> {user?.name}
          </p>
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
          <p>
            <strong>Role:</strong> {user?.role}
          </p>
          <p className="muted">Use the quick links to manage your health records.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

