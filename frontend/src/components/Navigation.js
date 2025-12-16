import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

function Navigation() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav data-testid="main-navigation">
      <ul>
        <li>
          <Link to="/" data-testid="nav-home" id="nav-home" className="logo">
            Mount Hospital
          </Link>
        </li>
        <li>
          <Link to="/" data-testid="nav-home-link" id="nav-home-link">
            Home
          </Link>
        </li>
        <li>
          <Link to="/patient-registration" data-testid="nav-register" id="nav-register">
            Register Patient
          </Link>
        </li>
        <li>
          <Link to="/appointments" data-testid="nav-appointments" id="nav-appointments">
            Book Appointment
          </Link>
        </li>
        <li>
          <Link to="/doctors" data-testid="nav-doctors" id="nav-doctors">
            Doctors
          </Link>
        </li>

        {isAuthenticated && (
          <>
            <li>
              <Link to="/dashboard" data-testid="nav-dashboard" id="nav-dashboard">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/test-results" data-testid="nav-test-results" id="nav-test-results">
                Test Results
              </Link>
            </li>
            <li>
              <Link to="/insurance" data-testid="nav-insurance" id="nav-insurance">
                Insurance
              </Link>
            </li>
            <li>
              <Link to="/payment" data-testid="nav-payments" id="nav-payments">
                Payments
              </Link>
            </li>
          </>
        )}

        <li className="nav-auth">
          {isAuthenticated ? (
            <div className="user-chip" data-testid="nav-user-chip">
              <span className="user-name">{user?.name}</span>
              <button className="btn btn-secondary btn-compact" onClick={logout} data-testid="nav-logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" data-testid="nav-login">
                Login
              </Link>
              <Link to="/register" data-testid="nav-signup">
                Sign Up
              </Link>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
}

export default Navigation;
