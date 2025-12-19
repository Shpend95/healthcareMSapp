import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, User } from '../context/AuthContext';
import { profileService, patientService } from '../services/api';
import BasicPatientInfoSection from '../components/profile/BasicPatientInfoSection';
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

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  userId: number;
  [key: string]: any;
}

const PatientProfile: React.FC = () => {
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('personal');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ type: '', message: '' });

  const loadPatient = useCallback(async () => {
    if (!user || !user.id) {
      console.log('PatientProfile: No user or user.id, skipping patient load');
      setLoading(false);
      return;
    }
    
    console.log('PatientProfile: Loading patient for user ID:', user.id);
    try {
      setLoading(true);
      const patientResponse = await patientService.getByUserId(user.id);
      console.log('PatientProfile: Patient data loaded:', patientResponse.data);
      const patientData = patientResponse.data;
      setPatient(patientData);
      
      // Now load profile using patient ID
      try {
        const profileResponse = await profileService.getProfile(patientData.id);
        console.log('PatientProfile: Profile data loaded:', profileResponse.data);
        setProfile(profileResponse.data);
      } catch (profileErr: any) {
        // Profile might not exist yet, that's okay
        console.log('PatientProfile: No profile found, will create on first save');
        setProfile(null);
      }
      
      setError('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load patient record. Please contact support.';
      setError(errorMessage);
      console.error('PatientProfile: Error loading patient:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.id) {
      loadPatient();
    } else {
      setLoading(false);
    }
  }, [user, loadPatient]);

  const handleSaveSuccess = useCallback(async (message: string) => {
    setSaveStatus({ type: 'success', message });
    setTimeout(() => setSaveStatus({ type: '', message: '' }), 5000);
    // Reload patient and profile data
    await loadPatient();
  }, [loadPatient]);

  const handleSaveError = useCallback((message: string) => {
    setSaveStatus({ type: 'error', message });
    setTimeout(() => setSaveStatus({ type: '', message: '' }), 5000);
  }, []);

  const sections = [
    { id: 'basic', label: 'Basic Information', icon: '📋' },
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
          {patient && patient.id ? (
            <>
              {activeSection === 'basic' && (
                <BasicPatientInfoSection
                  patient={patient}
                  onSave={handleSaveSuccess}
                  onError={handleSaveError}
                />
              )}
              {activeSection === 'personal' && (
                <PersonalInfoSection
                  patientId={patient.id}
                  profile={profile || { ...patient, patientId: patient.id }}
                  onSave={handleSaveSuccess}
                  onError={handleSaveError}
                />
              )}
              {activeSection === 'address' && (
                <AddressSection
                  patientId={patient.id}
                  profile={profile}
                  onSave={handleSaveSuccess}
                  onError={handleSaveError}
                />
              )}
              {activeSection === 'insurance' && (
                <InsuranceSection
                  patientId={patient.id}
                  profile={profile}
                  onSave={handleSaveSuccess}
                  onError={handleSaveError}
                />
              )}
              {activeSection === 'picture' && (
                <ProfilePictureSection
                  patientId={patient.id}
                  profile={profile}
                  onSave={handleSaveSuccess}
                  onError={handleSaveError}
                />
              )}
              {activeSection === 'payment' && (
                <PaymentMethodsSection
                  patientId={patient.id}
                  profile={profile}
                  onSave={handleSaveSuccess}
                  onError={handleSaveError}
                />
              )}
              {activeSection === 'emergency' && (
                <EmergencyContactsSection
                  patientId={patient.id}
                  profile={profile}
                  onSave={handleSaveSuccess}
                  onError={handleSaveError}
                />
              )}
              {activeSection === 'preferences' && (
                <MedicalPreferencesSection
                  patientId={patient.id}
                  profile={profile}
                  onSave={handleSaveSuccess}
                  onError={handleSaveError}
                />
              )}
            </>
          ) : (
            <div className="error" role="alert">
              {error || 'Please log in to view your profile.'}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PatientProfile;

