import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/api';
import PersonalInfoSection from '../components/profile/PersonalInfoSection';
import AddressSection from '../components/profile/AddressSection';
import InsuranceSection from '../components/profile/InsuranceSection';
import ProfilePictureSection from '../components/profile/ProfilePictureSection';
import PaymentMethodsSection from '../components/profile/PaymentMethodsSection';
import EmergencyContactsSection from '../components/profile/EmergencyContactsSection';
import MedicalPreferencesSection from '../components/profile/MedicalPreferencesSection';

interface SaveStatus {
  type: 'success' | 'error' | '';
  message: string;
}

interface Profile {
  id?: number;
  patientId?: number;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  [key: string]: any;
}

const PatientProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('personal');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ type: '', message: '' });

  const loadProfile = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await profileService.getProfile(user.id);
      setProfile(response.data);
      setError('');
    } catch (err: any) {
      setError('Failed to load profile. Please try again.');
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user && user.id) {
      loadProfile();
    }
  }, [user, loadProfile]);

  const handleSaveSuccess = useCallback((message: string) => {
    setSaveStatus({ type: 'success', message });
    setTimeout(() => setSaveStatus({ type: '', message: '' }), 5000);
    loadProfile(); // Reload to get updated data
  }, [loadProfile]);

  const handleSaveError = useCallback((message: string) => {
    setSaveStatus({ type: 'error', message });
    setTimeout(() => setSaveStatus({ type: '', message: '' }), 5000);
  }, []);

  const sections = [
    { id: 'personal', label: 'Personal Information', icon: '👤' },
    { id: 'address', label: 'Addresses', icon: '📍' },
    { id: 'insurance', label: 'Insurance', icon: '🏥' },
    { id: 'picture', label: 'Profile Picture', icon: '📷' },
    { id: 'payment', label: 'Payment Methods', icon: '💳' },
    { id: 'emergency', label: 'Emergency Contacts', icon: '🚨' },
    { id: 'preferences', label: 'Communication Preferences', icon: '⚙️' },
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
              patientId={user?.id}
              profile={profile}
              onSave={handleSaveSuccess}
              onError={handleSaveError}
            />
          )}
          {activeSection === 'address' && (
            <AddressSection
              patientId={user?.id}
              profile={profile}
              onSave={handleSaveSuccess}
              onError={handleSaveError}
            />
          )}
          {activeSection === 'insurance' && (
            <InsuranceSection
              patientId={user?.id}
              profile={profile}
              onSave={handleSaveSuccess}
              onError={handleSaveError}
            />
          )}
          {activeSection === 'picture' && (
            <ProfilePictureSection
              patientId={user?.id}
              profile={profile}
              onSave={handleSaveSuccess}
              onError={handleSaveError}
            />
          )}
          {activeSection === 'payment' && (
            <PaymentMethodsSection
              patientId={user?.id}
              profile={profile}
              onSave={handleSaveSuccess}
              onError={handleSaveError}
            />
          )}
          {activeSection === 'emergency' && (
            <EmergencyContactsSection
              patientId={user?.id}
              profile={profile}
              onSave={handleSaveSuccess}
              onError={handleSaveError}
            />
          )}
          {activeSection === 'preferences' && (
            <MedicalPreferencesSection
              patientId={user?.id}
              profile={profile}
              onSave={handleSaveSuccess}
              onError={handleSaveError}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default PatientProfile;

