import React, { useState, useEffect } from 'react';
import { profileService } from '../../services/api';
import { validateEmail, validatePhone, validateRequired, calculateAge, formatPhoneNumber } from '../../utils/validation';
import { announceToScreenReader } from '../../utils/accessibility';

function PersonalInfoSection({ patientId, profile, onSave, onError }) {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    dateOfBirth: '',
    gender: '',
    pronouns: '',
    preferredLanguage: 'en',
    primaryPhone: '',
    secondaryPhone: '',
    mobilePhone: '',
    preferredContactMethod: 'email',
    primaryEmail: '',
    secondaryEmail: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [emailVerificationStatus, setEmailVerificationStatus] = useState({});

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        middleName: profile.middleName || '',
        lastName: profile.lastName || '',
        suffix: profile.suffix || '',
        dateOfBirth: profile.dateOfBirth || '',
        gender: profile.gender || '',
        pronouns: profile.pronouns || '',
        preferredLanguage: profile.preferredLanguage || 'en',
        primaryPhone: profile.primaryPhone || '',
        secondaryPhone: profile.secondaryPhone || '',
        mobilePhone: profile.mobilePhone || '',
        preferredContactMethod: profile.preferredContactMethod || 'email',
        primaryEmail: profile.primaryEmail || profile.email || '',
        secondaryEmail: profile.secondaryEmail || '',
      });
      setEmailVerificationStatus({
        primaryEmail: profile.primaryEmailVerified || false,
        secondaryEmail: profile.secondaryEmailVerified || false,
      });
    }
  }, [profile]);

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'firstName':
      case 'lastName':
        error = validateRequired(value, name === 'firstName' ? 'First name' : 'Last name').message || '';
        break;
      case 'primaryEmail':
      case 'secondaryEmail':
        if (value) {
          error = validateEmail(value).message || '';
        }
        break;
      case 'primaryPhone':
      case 'secondaryPhone':
      case 'mobilePhone':
        if (value) {
          error = validatePhone(value).message || '';
        }
        break;
      case 'dateOfBirth':
        if (value) {
          const age = calculateAge(value);
          if (age !== null && age < 0) {
            error = 'Date of birth cannot be in the future';
          }
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
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

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      announceToScreenReader('Please fix form errors before saving');
      return;
    }

    try {
      await profileService.updatePersonalInfo(patientId, formData);
      announceToScreenReader('Personal information saved successfully');
      onSave('Personal information updated successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update personal information';
      announceToScreenReader(errorMsg);
      onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const age = formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : null;

  return (
    <section
      data-testid="personal-info-section"
      data-section="personal-information"
      aria-labelledby="personal-info-heading"
    >
      <div className="card">
        <h2 id="personal-info-heading" data-testid="personal-info-heading">
          Personal Information
        </h2>
        <p className="muted" data-testid="personal-info-description">
          Update your personal details and contact information
        </p>

        <form onSubmit={handleSubmit} data-testid="personal-info-form" data-form-type="personal-info">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="firstName" data-testid="first-name-label">
                First Name <span aria-label="required">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                aria-required="true"
                aria-invalid={errors.firstName ? 'true' : 'false'}
                aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                data-testid="first-name-input"
                data-field="firstName"
                className={errors.firstName ? 'error' : ''}
              />
              {errors.firstName && (
                <span
                  id="firstName-error"
                  className="error-message"
                  data-testid="first-name-error"
                  data-field-error="firstName"
                  role="alert"
                >
                  {errors.firstName}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="middleName" data-testid="middle-name-label">
                Middle Name
              </label>
              <input
                type="text"
                id="middleName"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                data-testid="middle-name-input"
                data-field="middleName"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName" data-testid="last-name-label">
                Last Name <span aria-label="required">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                aria-required="true"
                aria-invalid={errors.lastName ? 'true' : 'false'}
                aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                data-testid="last-name-input"
                data-field="lastName"
                className={errors.lastName ? 'error' : ''}
              />
              {errors.lastName && (
                <span
                  id="lastName-error"
                  className="error-message"
                  data-testid="last-name-error"
                  data-field-error="lastName"
                  role="alert"
                >
                  {errors.lastName}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="suffix" data-testid="suffix-label">
                Suffix
              </label>
              <select
                id="suffix"
                name="suffix"
                value={formData.suffix}
                onChange={handleChange}
                data-testid="suffix-select"
                data-field="suffix"
              >
                <option value="">None</option>
                <option value="Jr">Jr</option>
                <option value="Sr">Sr</option>
                <option value="II">II</option>
                <option value="III">III</option>
                <option value="IV">IV</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dateOfBirth" data-testid="dob-label">
                Date of Birth <span aria-label="required">*</span>
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                aria-required="true"
                aria-invalid={errors.dateOfBirth ? 'true' : 'false'}
                aria-describedby={errors.dateOfBirth ? 'dateOfBirth-error' : undefined}
                data-testid="dob-input"
                data-field="dateOfBirth"
                className={errors.dateOfBirth ? 'error' : ''}
              />
              {age !== null && (
                <span className="muted" data-testid="age-display">
                  Age: {age} years
                </span>
              )}
              {errors.dateOfBirth && (
                <span
                  id="dateOfBirth-error"
                  className="error-message"
                  data-testid="dob-error"
                  data-field-error="dateOfBirth"
                  role="alert"
                >
                  {errors.dateOfBirth}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="gender" data-testid="gender-label">
                Gender Identity
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                data-testid="gender-select"
                data-field="gender"
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="pronouns" data-testid="pronouns-label">
                Pronouns
              </label>
              <select
                id="pronouns"
                name="pronouns"
                value={formData.pronouns}
                onChange={handleChange}
                data-testid="pronouns-select"
                data-field="pronouns"
              >
                <option value="">Prefer not to say</option>
                <option value="he/him">He/Him</option>
                <option value="she/her">She/Her</option>
                <option value="they/them">They/Them</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="preferredLanguage" data-testid="language-label">
                Preferred Language
              </label>
              <select
                id="preferredLanguage"
                name="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={handleChange}
                data-testid="language-select"
                data-field="preferredLanguage"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="zh">Chinese</option>
                <option value="fr">French</option>
                <option value="ar">Arabic</option>
              </select>
            </div>
          </div>

          <h3 data-testid="contact-info-heading" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
            Contact Information
          </h3>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="primaryEmail" data-testid="primary-email-label">
                Primary Email <span aria-label="required">*</span>
              </label>
              <input
                type="email"
                id="primaryEmail"
                name="primaryEmail"
                value={formData.primaryEmail}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                aria-required="true"
                aria-invalid={errors.primaryEmail ? 'true' : 'false'}
                aria-describedby={errors.primaryEmail ? 'primaryEmail-error' : undefined}
                data-testid="primary-email-input"
                data-field="primaryEmail"
                className={errors.primaryEmail ? 'error' : ''}
              />
              {emailVerificationStatus.primaryEmail && (
                <span className="muted" data-testid="email-verified-badge">
                  ✓ Verified
                </span>
              )}
              {errors.primaryEmail && (
                <span
                  id="primaryEmail-error"
                  className="error-message"
                  data-testid="primary-email-error"
                  data-field-error="primaryEmail"
                  role="alert"
                >
                  {errors.primaryEmail}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="secondaryEmail" data-testid="secondary-email-label">
                Secondary Email
              </label>
              <input
                type="email"
                id="secondaryEmail"
                name="secondaryEmail"
                value={formData.secondaryEmail}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={errors.secondaryEmail ? 'true' : 'false'}
                aria-describedby={errors.secondaryEmail ? 'secondaryEmail-error' : undefined}
                data-testid="secondary-email-input"
                data-field="secondaryEmail"
                className={errors.secondaryEmail ? 'error' : ''}
              />
              {emailVerificationStatus.secondaryEmail && (
                <span className="muted" data-testid="secondary-email-verified-badge">
                  ✓ Verified
                </span>
              )}
              {errors.secondaryEmail && (
                <span
                  id="secondaryEmail-error"
                  className="error-message"
                  data-testid="secondary-email-error"
                  data-field-error="secondaryEmail"
                  role="alert"
                >
                  {errors.secondaryEmail}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="primaryPhone" data-testid="primary-phone-label">
                Primary Phone
              </label>
              <input
                type="tel"
                id="primaryPhone"
                name="primaryPhone"
                value={formData.primaryPhone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="(555) 123-4567"
                aria-invalid={errors.primaryPhone ? 'true' : 'false'}
                aria-describedby={errors.primaryPhone ? 'primaryPhone-error' : undefined}
                data-testid="primary-phone-input"
                data-field="primaryPhone"
                className={errors.primaryPhone ? 'error' : ''}
              />
              {errors.primaryPhone && (
                <span
                  id="primaryPhone-error"
                  className="error-message"
                  data-testid="primary-phone-error"
                  data-field-error="primaryPhone"
                  role="alert"
                >
                  {errors.primaryPhone}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="secondaryPhone" data-testid="secondary-phone-label">
                Secondary Phone
              </label>
              <input
                type="tel"
                id="secondaryPhone"
                name="secondaryPhone"
                value={formData.secondaryPhone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="(555) 123-4567"
                aria-invalid={errors.secondaryPhone ? 'true' : 'false'}
                aria-describedby={errors.secondaryPhone ? 'secondaryPhone-error' : undefined}
                data-testid="secondary-phone-input"
                data-field="secondaryPhone"
                className={errors.secondaryPhone ? 'error' : ''}
              />
              {errors.secondaryPhone && (
                <span
                  id="secondaryPhone-error"
                  className="error-message"
                  data-testid="secondary-phone-error"
                  data-field-error="secondaryPhone"
                  role="alert"
                >
                  {errors.secondaryPhone}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="mobilePhone" data-testid="mobile-phone-label">
                Mobile Phone
              </label>
              <input
                type="tel"
                id="mobilePhone"
                name="mobilePhone"
                value={formData.mobilePhone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="(555) 123-4567"
                aria-invalid={errors.mobilePhone ? 'true' : 'false'}
                aria-describedby={errors.mobilePhone ? 'mobilePhone-error' : undefined}
                data-testid="mobile-phone-input"
                data-field="mobilePhone"
                className={errors.mobilePhone ? 'error' : ''}
              />
              {errors.mobilePhone && (
                <span
                  id="mobilePhone-error"
                  className="error-message"
                  data-testid="mobile-phone-error"
                  data-field-error="mobilePhone"
                  role="alert"
                >
                  {errors.mobilePhone}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="preferredContactMethod" data-testid="contact-method-label">
                Preferred Contact Method
              </label>
              <select
                id="preferredContactMethod"
                name="preferredContactMethod"
                value={formData.preferredContactMethod}
                onChange={handleChange}
                data-testid="contact-method-select"
                data-field="preferredContactMethod"
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="mobile">Mobile</option>
                <option value="sms">SMS</option>
              </select>
            </div>
          </div>

          <div className="actions-row">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              data-testid="save-personal-info-btn"
              data-action="save-personal-info"
              aria-label="Save personal information"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default PersonalInfoSection;

