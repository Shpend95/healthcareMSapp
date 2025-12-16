import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../services/api';

function PatientRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
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
    // Clear error for this field when user starts typing
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
      // Format date for backend
      const formattedData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth
      };

      const response = await patientService.register(formattedData);
      
      setSuccessMessage(`Patient registered successfully! Patient ID: ${response.data.id}`);
      
      // Clear form
      setFormData({
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        address: ''
      });

      // Navigate to dashboard after 2 seconds
      setTimeout(() => {
        navigate(`/dashboard/${response.data.id}`);
      }, 2000);

    } catch (error) {
      if (error.response?.data?.message) {
        setSubmitError(error.response.data.message);
      } else {
        setSubmitError('Failed to register patient. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="patient-registration-page">
      <div className="page-header">
        <h1 data-testid="registration-title">Patient Registration</h1>
        <p data-testid="registration-subtitle">Please fill in your information to register</p>
      </div>

      <div className="form-container">
        {submitError && (
          <div className="error" data-testid="registration-error">
            {submitError}
          </div>
        )}
        {successMessage && (
          <div className="success" data-testid="registration-success">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} data-testid="patient-registration-form">
          <div className="form-group">
            <label htmlFor="patient-name">Full Name *</label>
            <input
              type="text"
              id="patient-name"
              name="name"
              data-testid="patient-name-input"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && (
              <span className="error-message" data-testid="patient-name-error">
                {errors.name}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="patient-email">Email *</label>
            <input
              type="email"
              id="patient-email"
              name="email"
              data-testid="patient-email-input"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && (
              <span className="error-message" data-testid="patient-email-error">
                {errors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="patient-phone">Phone Number *</label>
            <input
              type="tel"
              id="patient-phone"
              name="phone"
              data-testid="patient-phone-input"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && (
              <span className="error-message" data-testid="patient-phone-error">
                {errors.phone}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="patient-dob">Date of Birth *</label>
            <input
              type="date"
              id="patient-dob"
              name="dateOfBirth"
              data-testid="patient-dob-input"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className={errors.dateOfBirth ? 'error' : ''}
            />
            {errors.dateOfBirth && (
              <span className="error-message" data-testid="patient-dob-error">
                {errors.dateOfBirth}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="patient-address">Address *</label>
            <textarea
              id="patient-address"
              name="address"
              rows="3"
              data-testid="patient-address-input"
              value={formData.address}
              onChange={handleChange}
              className={errors.address ? 'error' : ''}
            ></textarea>
            {errors.address && (
              <span className="error-message" data-testid="patient-address-error">
                {errors.address}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            data-testid="submit-btn"
            id="submit-btn"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register Patient'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PatientRegistration;
