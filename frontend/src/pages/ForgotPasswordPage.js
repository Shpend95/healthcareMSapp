import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email');
      return;
    }

    try {
      requestPasswordReset(email.trim());
      setSuccess('If an account exists for this email, a reset link has been sent.');
    } catch (err) {
      setError(err.message || 'Unable to process request right now.');
    }
  };

  return (
    <div className="auth-page" data-testid="forgot-password-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Reset your password</h1>
          <p>Enter your email and we’ll send reset instructions.</p>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form" data-testid="forgot-password-form">
          <div className="form-group">
            <label htmlFor="forgot-email">Email</label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
                setSuccess('');
              }}
              autoComplete="email"
              data-testid="forgot-email-input"
            />
          </div>
          <button type="submit" className="btn btn-primary full-width" data-testid="forgot-submit-btn">
            Send reset link
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login" className="link">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;

