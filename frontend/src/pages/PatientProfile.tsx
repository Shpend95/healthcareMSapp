import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { patientService, profileService } from '../services/api';

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  userId: number;
}

interface EmergencyContact {
  firstName: string;
  lastName: string;
  relationship: string;
  primaryPhone: string;
  secondaryPhone?: string;
  email?: string;
}

const PatientProfile: React.FC = () => {
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    emergencyContact: {
      firstName: '',
      lastName: '',
      relationship: '',
      primaryPhone: '',
      secondaryPhone: '',
      email: '',
    } as EmergencyContact,
  });

  useEffect(() => {
    if (user && user.id) {
      loadPatientData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadPatientData = async () => {
    if (!user || !user.id) return;

    try {
      setLoading(true);
      setError('');

      // Load patient data
      const patientResponse = await patientService.getByUserId(user.id);
      const patientData = patientResponse.data;
      setPatient(patientData);

      // Initialize form data
      setFormData({
        name: patientData.name || '',
        phone: patientData.phone || '',
        address: patientData.address || '',
        dateOfBirth: patientData.dateOfBirth || '',
        emergencyContact: {
          firstName: '',
          lastName: '',
          relationship: '',
          primaryPhone: '',
          secondaryPhone: '',
          email: '',
        },
      });

      // Load emergency contact
      try {
        const emergencyContactsResponse = await profileService.getEmergencyContacts(patientData.id);
        const contacts = emergencyContactsResponse.data || [];
        if (contacts.length > 0) {
          const primaryContact = contacts.find((c: any) => c.isPrimary) || contacts[0];
          setEmergencyContact(primaryContact);
          setFormData(prev => ({
            ...prev,
            emergencyContact: {
              firstName: primaryContact.firstName || '',
              lastName: primaryContact.lastName || '',
              relationship: primaryContact.relationship || '',
              primaryPhone: primaryContact.primaryPhone || '',
              secondaryPhone: primaryContact.secondaryPhone || '',
              email: primaryContact.email || '',
            },
          }));
        }
      } catch (err) {
        // Emergency contact might not exist, that's okay
        console.log('No emergency contact found');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load patient record. Please contact support.';
      setError(errorMessage);
      console.error('Error loading patient:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('emergencyContact.')) {
      const field = name.replace('emergencyContact.', '');
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    if (!patient || !patient.id) {
      setError('Patient ID not found');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      // Prepare update payload
      const updatePayload: any = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
      };

      // Include emergency contact if provided
      if (formData.emergencyContact.firstName || formData.emergencyContact.lastName) {
        updatePayload.emergencyContact = {
          firstName: formData.emergencyContact.firstName,
          lastName: formData.emergencyContact.lastName,
          relationship: formData.emergencyContact.relationship,
          primaryPhone: formData.emergencyContact.primaryPhone,
          secondaryPhone: formData.emergencyContact.secondaryPhone || null,
          email: formData.emergencyContact.email || null,
        };
      }

      await patientService.update(patient.id, updatePayload);

      setSuccessMessage('Profile updated successfully!');
      setIsEditMode(false);
      
      // Reload patient data
      await loadPatientData();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile. Please try again.';
      setError(errorMessage);
      console.error('Error updating patient:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (patient) {
      // Reset form data to original values
      setFormData({
        name: patient.name || '',
        phone: patient.phone || '',
        address: patient.address || '',
        dateOfBirth: patient.dateOfBirth || '',
        emergencyContact: emergencyContact ? {
          firstName: emergencyContact.firstName || '',
          lastName: emergencyContact.lastName || '',
          relationship: emergencyContact.relationship || '',
          primaryPhone: emergencyContact.primaryPhone || '',
          secondaryPhone: emergencyContact.secondaryPhone || '',
          email: emergencyContact.email || '',
        } : {
          firstName: '',
          lastName: '',
          relationship: '',
          primaryPhone: '',
          secondaryPhone: '',
          email: '',
        },
      });
    }
    setIsEditMode(false);
    setError('');
    setSuccessMessage('');
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error && !patient) {
    return (
      <div className="page-container">
        <div className="error" role="alert">{error}</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="page-container">
        <div className="error">No patient record found. Please contact support.</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Patient Profile</h1>
        {!isEditMode && (
          <button
            className="btn btn-primary"
            onClick={() => setIsEditMode(true)}
            data-testid="edit-profile-button"
          >
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div className="error" role="alert" data-testid="error-message">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="success" role="alert" data-testid="success-message">
          {successMessage}
        </div>
      )}

      <div className="card">
        {isEditMode ? (
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <h2>Edit Profile</h2>
            
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                data-testid="name-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                data-testid="phone-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                data-testid="address-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth *</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
                data-testid="date-of-birth-input"
              />
            </div>

            <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Emergency Contact</h3>

            <div className="form-group">
              <label htmlFor="emergencyContact.firstName">First Name</label>
              <input
                type="text"
                id="emergencyContact.firstName"
                name="emergencyContact.firstName"
                value={formData.emergencyContact.firstName}
                onChange={handleInputChange}
                data-testid="emergency-contact-first-name-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="emergencyContact.lastName">Last Name</label>
              <input
                type="text"
                id="emergencyContact.lastName"
                name="emergencyContact.lastName"
                value={formData.emergencyContact.lastName}
                onChange={handleInputChange}
                data-testid="emergency-contact-last-name-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="emergencyContact.relationship">Relationship</label>
              <select
                id="emergencyContact.relationship"
                name="emergencyContact.relationship"
                value={formData.emergencyContact.relationship}
                onChange={handleInputChange}
                data-testid="emergency-contact-relationship-select"
              >
                <option value="">Select Relationship</option>
                <option value="spouse">Spouse</option>
                <option value="parent">Parent</option>
                <option value="child">Child</option>
                <option value="sibling">Sibling</option>
                <option value="friend">Friend</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="emergencyContact.primaryPhone">Primary Phone</label>
              <input
                type="tel"
                id="emergencyContact.primaryPhone"
                name="emergencyContact.primaryPhone"
                value={formData.emergencyContact.primaryPhone}
                onChange={handleInputChange}
                data-testid="emergency-contact-primary-phone-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="emergencyContact.secondaryPhone">Secondary Phone</label>
              <input
                type="tel"
                id="emergencyContact.secondaryPhone"
                name="emergencyContact.secondaryPhone"
                value={formData.emergencyContact.secondaryPhone}
                onChange={handleInputChange}
                data-testid="emergency-contact-secondary-phone-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="emergencyContact.email">Email</label>
              <input
                type="email"
                id="emergencyContact.email"
                name="emergencyContact.email"
                value={formData.emergencyContact.email}
                onChange={handleInputChange}
                data-testid="emergency-contact-email-input"
              />
            </div>

            <div className="actions-row" style={{ marginTop: '2rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                data-testid="save-profile-button"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={saving}
                data-testid="cancel-profile-button"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <h2>Patient Information</h2>
            
            <div className="profile-info">
              <div className="info-row">
                <strong>Name:</strong>
                <span data-testid="name-display">{patient.name}</span>
              </div>
              
              <div className="info-row">
                <strong>Email:</strong>
                <span data-testid="email-display">{patient.email}</span>
              </div>
              
              <div className="info-row">
                <strong>Phone:</strong>
                <span data-testid="phone-display">{patient.phone}</span>
              </div>
              
              <div className="info-row">
                <strong>Address:</strong>
                <span data-testid="address-display">{patient.address}</span>
              </div>
              
              <div className="info-row">
                <strong>Date of Birth:</strong>
                <span data-testid="date-of-birth-display">
                  {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'Not provided'}
                </span>
              </div>
              
              <div className="info-row">
                <strong>Blood Group:</strong>
                <span data-testid="blood-group-display">Not available</span>
              </div>
            </div>

            {emergencyContact && (
              <div style={{ marginTop: '2rem' }}>
                <h3>Emergency Contact</h3>
                <div className="profile-info">
                  <div className="info-row">
                    <strong>Name:</strong>
                    <span data-testid="emergency-contact-name-display">
                      {emergencyContact.firstName} {emergencyContact.lastName}
                    </span>
                  </div>
                  
                  <div className="info-row">
                    <strong>Relationship:</strong>
                    <span data-testid="emergency-contact-relationship-display">
                      {emergencyContact.relationship}
                    </span>
                  </div>
                  
                  <div className="info-row">
                    <strong>Primary Phone:</strong>
                    <span data-testid="emergency-contact-primary-phone-display">
                      {emergencyContact.primaryPhone}
                    </span>
                  </div>
                  
                  {emergencyContact.secondaryPhone && (
                    <div className="info-row">
                      <strong>Secondary Phone:</strong>
                      <span data-testid="emergency-contact-secondary-phone-display">
                        {emergencyContact.secondaryPhone}
                      </span>
                    </div>
                  )}
                  
                  {emergencyContact.email && (
                    <div className="info-row">
                      <strong>Email:</strong>
                      <span data-testid="emergency-contact-email-display">
                        {emergencyContact.email}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!emergencyContact && (
              <div style={{ marginTop: '2rem' }}>
                <h3>Emergency Contact</h3>
                <p className="muted">No emergency contact on file. Click "Edit Profile" to add one.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientProfile;
