import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true,
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) return;

    try {
      setLoading(true);
      const loggedInUser = await login(formData.email.trim(), formData.password, formData.rememberMe);

      const role = (loggedInUser.role || '').toUpperCase();
      let redirectTo = '/dashboard';
      if (role === 'ADMIN') {
        redirectTo = '/admin';
      } else if (role === 'DOCTOR') {
        redirectTo = '/doctor';
      } else if (role === 'NURSE') {
        redirectTo = '/nurse';
      } else if (role === 'PATIENT') {
        redirectTo = '/dashboard';
      }

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setSubmitError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" data-testid="login-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome back</h1>
          <p>Sign in to access your Mount Sinai dashboard</p>
        </div>

        {submitError && (
          <div className="error" data-testid="login-error">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" data-testid="login-form">
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              autoComplete="email"
              data-testid="login-email-input"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              autoComplete="current-password"
              data-testid="login-password-input"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-row">
            <label className="checkbox">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                data-testid="login-remember-checkbox"
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="link" data-testid="forgot-password-link">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary full-width"
            disabled={loading}
            data-testid="login-submit-btn"
          >
            {loading ? <span className="spinner" aria-label="logging in" /> : 'Sign in'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Need an account?{' '}
            <Link to="/register" className="link" data-testid="login-register-link">
              Create one
            </Link>
          </p>
          <p className="muted">Use admin@mountsinai.com / Admin123 or patient@test.com / Patient123</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

