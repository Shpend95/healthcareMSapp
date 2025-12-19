import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/api';
import PersonalInfoSection from '../components/profile/PersonalInfoSection';
import AddressSection from '../components/profile/AddressSection';
import InsuranceSection from '../components/profile/InsuranceSection';
import ProfilePictureSection from '../components/profile/ProfilePictureSection';
import PaymentMethodsSection from '../components/profile/PaymentMethodsSection';
import EmergencyContactsSection from '../components/profile/EmergencyContactsSection';
import MedicalPreferencesSection from '../components/profile/MedicalPreferencesSection';

function PatientProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('personal');
  const [saveStatus, setSaveStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    if (user && user.id) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await profileService.getProfile(user.id);
      setProfile(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load profile. Please try again.');
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSuccess = (message) => {
    setSaveStatus({ type: 'success', message });
    setTimeout(() => setSaveStatus({ type: '', message: '' }), 5000);
    loadProfile(); // Reload to get updated data
  };

  const handleSaveError = (message) => {
    setSaveStatus({ type: 'error', message });
    setTimeout(() => setSaveStatus({ type: '', message: '' }), 5000);
  };

  const sections = [
    { id: 'personal', label: 'Personal Information', icon: '👤' },
    { id: 'address', label: 'Addresses', icon: '📍' },
    { id: 'insurance', label: 'Insurance', icon: '🏥' },
    { id: 'picture', label: 'Profile Picture', icon: '📷' },
    { id: 'payment', label: 'Payment Methods', icon: '💳' },
    { id: 'emergency', label: 'Emergency Contacts', icon: '🚨' },
    { id: 'preferences', label: 'Medical Preferences', icon: '⚙️' },
  ];

  if (loading) {
    return (
      <div data-testid="patient-profile-page">
        <div className="loading" data-testid="profile-loading" aria-live="polite">
          Loading profile...
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div data-testid="patient-profile-page">
        <div className="error" data-testid="profile-error" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="patient-profile-page" className="profile-page">
      <div className="page-header">
        <h1 data-testid="profile-title">Patient Profile</h1>
        <p data-testid="profile-subtitle">Manage your personal information and preferences</p>
      </div>

      {saveStatus.message && (
        <div
          className={saveStatus.type === 'success' ? 'success' : 'error'}
          data-testid={`profile-${saveStatus.type}-message`}
          role="alert"
          aria-live="polite"
        >
          {saveStatus.message}
        </div>
      )}

      <div className="profile-layout">
        <nav className="profile-nav" data-testid="profile-navigation" aria-label="Profile sections">
          <ul role="list">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  className={activeSection === section.id ? 'active' : ''}
                  onClick={() => setActiveSection(section.id)}
                  data-testid={`profile-nav-${section.id}`}
                  data-action={`select-section-${section.id}`}
                  aria-current={activeSection === section.id ? 'page' : undefined}
                  aria-label={`${section.label} section`}
                >
                  <span className="section-icon" aria-hidden="true">{section.icon}</span>
                  <span className="section-label">{section.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="profile-content" data-testid="profile-content">
          {activeSection === 'personal' && (
            <PersonalInfoSection
              patientId={user.id}
              profile={profile}
              onSave={handleSaveSuccess}
              onError={handleSaveError}
            />
          )}
          {activeSection === 'address' && (
            <AddressSection
              patientId={user.id}
              profile={profile}
              onSave={handleSaveSuccess}
              onError={handleSaveError}
            />
          )}
          {activeSection === 'insurance' && (
            <InsuranceSection
              patientId={user.id}
              profile={profile}
              onSave={handleSaveSuccess}
              onError={handleSaveError}
            />
          )}
          {activeSection === 'picture' && (
            <ProfilePictureSection
              patientId={user.id}
              profile={profile}
              onSave={handleSaveSuccess}
              onError={handleSaveError}
            />
          )}
          {activeSection === 'payment' && (
            <PaymentMethodsSection
              patientId={user.id}
              profile={profile}
              onSave={handleSaveSuccess}
              onError={handleSaveError}
            />
          )}
          {activeSection === 'emergency' && (
            <EmergencyContactsSection
              patientId={user.id}
              profile={profile}
              onSave={handleSaveSuccess}
              onError={handleSaveError}
            />
          )}
          {activeSection === 'preferences' && (
            <MedicalPreferencesSection
              patientId={user.id}
              profile={profile}
              onSave={handleSaveSuccess}
              onError={handleSaveError}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default PatientProfile;

