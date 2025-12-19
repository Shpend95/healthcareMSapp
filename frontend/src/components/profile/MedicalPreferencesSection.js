import React, { useState, useEffect } from 'react';
import { profileService, pharmacyService } from '../../services/api';
import { announceToScreenReader } from '../../utils/accessibility';

function MedicalPreferencesSection({ patientId, profile, onSave, onError }) {
  const [preferences, setPreferences] = useState({
    preferredPharmacy: '',
    preferredHospital: '',
    appointmentReminders: {
      email: true,
      sms: true,
      phone: false,
      push: true,
    },
    testResultsNotification: {
      email: true,
      sms: false,
    },
    billingStatements: {
      email: true,
      mail: false,
    },
    marketingCommunications: false,
    accessibilityNeeds: '',
    languageInterpreter: false,
    preferredLanguage: 'en',
  });
  const [loading, setLoading] = useState(false);
  const [pharmacies, setPharmacies] = useState([]);
  const [searchingPharmacy, setSearchingPharmacy] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [patientId]);

  const loadPreferences = async () => {
    try {
      const response = await profileService.getPreferences(patientId);
      if (response.data) {
        setPreferences(response.data);
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setPreferences(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handlePharmacySearch = async (query) => {
    if (query.length < 3) {
      setPharmacies([]);
      return;
    }

    setSearchingPharmacy(true);
    try {
      const response = await pharmacyService.searchPharmacies(query);
      setPharmacies(response.data || []);
    } catch (err) {
      console.error('Error searching pharmacies:', err);
    } finally {
      setSearchingPharmacy(false);
    }
  };

  const handleSelectPharmacy = async (pharmacyId) => {
    try {
      await pharmacyService.setPreferredPharmacy(patientId, pharmacyId);
      const pharmacy = pharmacies.find(p => p.id === pharmacyId);
      setPreferences(prev => ({
        ...prev,
        preferredPharmacy: pharmacy?.name || '',
      }));
      onSave('Preferred pharmacy updated');
    } catch (err) {
      onError('Failed to set preferred pharmacy');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await profileService.updatePreferences(patientId, preferences);
      announceToScreenReader('Preferences saved successfully');
      onSave('Medical preferences updated successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update preferences';
      onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      data-testid="medical-preferences-section"
      data-section="medical-preferences"
      aria-labelledby="medical-preferences-heading"
    >
      <div className="card">
        <h2 id="medical-preferences-heading" data-testid="medical-preferences-heading">
          Medical Preferences
        </h2>
        <p className="muted" data-testid="medical-preferences-description">
          Manage your communication preferences and medical facility preferences
        </p>

        <form onSubmit={handleSubmit} data-testid="preferences-form">
          <div className="form-group" style={{ marginTop: '2rem' }}>
            <label htmlFor="preferredPharmacy" data-testid="preferred-pharmacy-label">
              Preferred Pharmacy
            </label>
            <input
              type="text"
              id="preferredPharmacy"
              name="preferredPharmacy"
              value={preferences.preferredPharmacy}
              onChange={(e) => {
                handlePharmacySearch(e.target.value);
                handleChange(e);
              }}
              placeholder="Search for pharmacy..."
              data-testid="preferred-pharmacy-input"
            />
            {pharmacies.length > 0 && (
              <div className="dropdown" data-testid="pharmacy-dropdown" style={{ marginTop: '0.5rem' }}>
                {pharmacies.map(pharmacy => (
                  <div
                    key={pharmacy.id}
                    className="dropdown-item"
                    onClick={() => handleSelectPharmacy(pharmacy.id)}
                    data-testid={`pharmacy-option-${pharmacy.id}`}
                    style={{ padding: '0.5rem', cursor: 'pointer', border: '1px solid #ddd', marginBottom: '0.25rem' }}
                  >
                    {pharmacy.name} - {pharmacy.address}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="preferredHospital" data-testid="preferred-hospital-label">
              Preferred Hospital/Facility
            </label>
            <select
              id="preferredHospital"
              name="preferredHospital"
              value={preferences.preferredHospital}
              onChange={handleChange}
              data-testid="preferred-hospital-select"
            >
              <option value="">Select Facility</option>
              <option value="mount-sinai-main">Mount Sinai Main Campus</option>
              <option value="mount-sinai-west">Mount Sinai West</option>
              <option value="mount-sinai-brooklyn">Mount Sinai Brooklyn</option>
            </select>
          </div>

          <h3 data-testid="communication-preferences-heading" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
            Communication Preferences
          </h3>

          <div className="form-group">
            <label data-testid="appointment-reminders-label">
              Appointment Reminders
            </label>
            <div className="checkbox-group">
              <div className="checkbox">
                <input
                  type="checkbox"
                  id="reminder-email"
                  name="appointmentReminders.email"
                  checked={preferences.appointmentReminders.email}
                  onChange={handleChange}
                  data-testid="reminder-email-checkbox"
                />
                <label htmlFor="reminder-email">Email</label>
              </div>
              <div className="checkbox">
                <input
                  type="checkbox"
                  id="reminder-sms"
                  name="appointmentReminders.sms"
                  checked={preferences.appointmentReminders.sms}
                  onChange={handleChange}
                  data-testid="reminder-sms-checkbox"
                />
                <label htmlFor="reminder-sms">SMS</label>
              </div>
              <div className="checkbox">
                <input
                  type="checkbox"
                  id="reminder-phone"
                  name="appointmentReminders.phone"
                  checked={preferences.appointmentReminders.phone}
                  onChange={handleChange}
                  data-testid="reminder-phone-checkbox"
                />
                <label htmlFor="reminder-phone">Phone</label>
              </div>
              <div className="checkbox">
                <input
                  type="checkbox"
                  id="reminder-push"
                  name="appointmentReminders.push"
                  checked={preferences.appointmentReminders.push}
                  onChange={handleChange}
                  data-testid="reminder-push-checkbox"
                />
                <label htmlFor="reminder-push">Push Notification</label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label data-testid="test-results-label">
              Test Results Notification
            </label>
            <div className="checkbox-group">
              <div className="checkbox">
                <input
                  type="checkbox"
                  id="results-email"
                  name="testResultsNotification.email"
                  checked={preferences.testResultsNotification.email}
                  onChange={handleChange}
                  data-testid="results-email-checkbox"
                />
                <label htmlFor="results-email">Email</label>
              </div>
              <div className="checkbox">
                <input
                  type="checkbox"
                  id="results-sms"
                  name="testResultsNotification.sms"
                  checked={preferences.testResultsNotification.sms}
                  onChange={handleChange}
                  data-testid="results-sms-checkbox"
                />
                <label htmlFor="results-sms">SMS</label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label data-testid="billing-statements-label">
              Billing Statements
            </label>
            <div className="checkbox-group">
              <div className="checkbox">
                <input
                  type="checkbox"
                  id="billing-email"
                  name="billingStatements.email"
                  checked={preferences.billingStatements.email}
                  onChange={handleChange}
                  data-testid="billing-email-checkbox"
                />
                <label htmlFor="billing-email">Email</label>
              </div>
              <div className="checkbox">
                <input
                  type="checkbox"
                  id="billing-mail"
                  name="billingStatements.mail"
                  checked={preferences.billingStatements.mail}
                  onChange={handleChange}
                  data-testid="billing-mail-checkbox"
                />
                <label htmlFor="billing-mail">Mail</label>
              </div>
            </div>
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="marketing"
              name="marketingCommunications"
              checked={preferences.marketingCommunications}
              onChange={handleChange}
              data-testid="marketing-checkbox"
            />
            <label htmlFor="marketing" data-testid="marketing-label">
              I would like to receive marketing communications
            </label>
          </div>

          <h3 data-testid="accessibility-heading" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
            Accessibility & Language
          </h3>

          <div className="form-group">
            <label htmlFor="accessibilityNeeds" data-testid="accessibility-needs-label">
              Accessibility Needs
            </label>
            <textarea
              id="accessibilityNeeds"
              name="accessibilityNeeds"
              value={preferences.accessibilityNeeds}
              onChange={handleChange}
              rows="3"
              placeholder="Describe any accessibility needs..."
              data-testid="accessibility-needs-textarea"
            />
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="interpreter"
              name="languageInterpreter"
              checked={preferences.languageInterpreter}
              onChange={handleChange}
              data-testid="interpreter-checkbox"
            />
            <label htmlFor="interpreter" data-testid="interpreter-label">
              I need a language interpreter for appointments
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="preferredLanguage" data-testid="preferred-language-label">
              Preferred Language for Communications
            </label>
            <select
              id="preferredLanguage"
              name="preferredLanguage"
              value={preferences.preferredLanguage}
              onChange={handleChange}
              data-testid="preferred-language-select"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="zh">Chinese</option>
              <option value="fr">French</option>
              <option value="ar">Arabic</option>
            </select>
          </div>

          <div className="actions-row">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              data-testid="save-preferences-btn"
              data-action="save-preferences"
              aria-label="Save preferences"
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default MedicalPreferencesSection;

