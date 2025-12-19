import React, { useState, useEffect } from 'react';
import { patientService } from '../../services/api';

interface BasicPatientInfoSectionProps {
  patient: {
    id: number;
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    address: string;
  };
  onSave: (message: string) => void;
  onError: (message: string) => void;
}

const BasicPatientInfoSection: React.FC<BasicPatientInfoSectionProps> = ({ patient, onSave, onError }) => {
  const [formData, setFormData] = useState({
    name: patient.name || '',
    email: patient.email || '',
    phone: patient.phone || '',
    dateOfBirth: patient.dateOfBirth || '',
    address: patient.address || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setFormData({
      name: patient.name || '',
      email: patient.email || '',
      phone: patient.phone || '',
      dateOfBirth: patient.dateOfBirth || '',
      address: patient.address || '',
    });
  }, [patient]);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        return value.trim() ? '' : 'Name is required';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return value && !emailRegex.test(value) ? 'Invalid email address' : '';
      case 'phone':
        return value.trim() ? '' : 'Phone is required';
      case 'dateOfBirth':
        return value ? '' : 'Date of birth is required';
      case 'address':
        return value.trim() ? '' : 'Address is required';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate all fields
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      await patientService.update(patient.id, formData);
      setIsEditing(false);
      onSave('Patient information updated successfully');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update patient information';
      onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: patient.name || '',
      email: patient.email || '',
      phone: patient.phone || '',
      dateOfBirth: patient.dateOfBirth || '',
      address: patient.address || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <section data-testid="basic-patient-info-section">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 data-testid="basic-info-heading">Basic Information</h2>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsEditing(true)}
              data-testid="edit-basic-info-btn"
            >
              Edit
            </button>
          </div>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <strong>Name:</strong> {patient.name}
            </div>
            <div>
              <strong>Email:</strong> {patient.email}
            </div>
            <div>
              <strong>Phone:</strong> {patient.phone}
            </div>
            <div>
              <strong>Date of Birth:</strong> {patient.dateOfBirth}
            </div>
            <div>
              <strong>Address:</strong> {patient.address}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section data-testid="basic-patient-info-section">
      <div className="card">
        <h2 data-testid="basic-info-heading">Basic Information</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">
              Name <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.name ? 'error' : ''}
              data-testid="basic-info-name-input"
              required
            />
            {errors.name && <span className="error-message" role="alert">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.email ? 'error' : ''}
              data-testid="basic-info-email-input"
              required
            />
            {errors.email && <span className="error-message" role="alert">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">
              Phone <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.phone ? 'error' : ''}
              data-testid="basic-info-phone-input"
              required
            />
            {errors.phone && <span className="error-message" role="alert">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="dateOfBirth">
              Date of Birth <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.dateOfBirth ? 'error' : ''}
              data-testid="basic-info-dob-input"
              required
            />
            {errors.dateOfBirth && <span className="error-message" role="alert">{errors.dateOfBirth}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address">
              Address <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.address ? 'error' : ''}
              rows={3}
              data-testid="basic-info-address-input"
              required
            />
            {errors.address && <span className="error-message" role="alert">{errors.address}</span>}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              data-testid="save-basic-info-btn"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={loading}
              data-testid="cancel-basic-info-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default BasicPatientInfoSection;