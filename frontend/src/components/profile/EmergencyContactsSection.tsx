import React, { useState, useEffect, useCallback, useRef } from 'react';
import { profileService } from '../../services/api';
import { validateRequired, validatePhone, validateEmail } from '../../utils/validation';
import { announceToScreenReader } from '../../utils/accessibility';

interface EmergencyContactsSectionProps {
  patientId?: number;
  profile?: any;
  onSave: (message: string) => void;
  onError: (message: string) => void;
}

interface EmergencyContact {
  id?: number;
  firstName: string;
  lastName: string;
  relationship: string;
  primaryPhone: string;
  secondaryPhone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isPrimary?: boolean;
}

const EmergencyContactsSection: React.FC<EmergencyContactsSectionProps> = ({ 
  patientId, 
  profile, 
  onSave, 
  onError 
}) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<EmergencyContact>({
    firstName: '',
    lastName: '',
    relationship: '',
    primaryPhone: '',
    secondaryPhone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    isPrimary: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (patientId) {
      loadContacts();
    }
  }, [patientId]);

  const loadContacts = async () => {
    if (!patientId) return;
    
    try {
      const response = await profileService.getEmergencyContacts(patientId);
      setContacts(response.data || []);
    } catch (err) {
      console.error('Error loading emergency contacts:', err);
    }
  };

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.relationship) {
      newErrors.relationship = 'Relationship is required';
    }
    if (!formData.primaryPhone.trim()) {
      newErrors.primaryPhone = 'Primary phone is required';
    } else {
      const phoneValidation = validatePhone(formData.primaryPhone);
      if (!phoneValidation.valid) {
        newErrors.primaryPhone = phoneValidation.message || 'Invalid phone number';
      }
    }
    if (formData.secondaryPhone) {
      const phoneValidation = validatePhone(formData.secondaryPhone);
      if (!phoneValidation.valid) {
        newErrors.secondaryPhone = phoneValidation.message || 'Invalid phone number';
      }
    }
    if (formData.email && !validateEmail(formData.email).valid) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Auto-save draft after 2 seconds of inactivity
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      // Save draft to localStorage
      if (patientId) {
        localStorage.setItem(`emergency-contact-draft-${patientId}`, JSON.stringify(formData));
      }
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      announceToScreenReader('Please fix form errors before saving');
      return;
    }

    if (!patientId) {
      onError('Patient ID is required');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await profileService.updateEmergencyContact(patientId, editingId, formData);
        announceToScreenReader('Emergency contact updated successfully');
        onSave('Emergency contact updated successfully');
      } else {
        await profileService.addEmergencyContact(patientId, formData);
        announceToScreenReader('Emergency contact added successfully');
        onSave('Emergency contact added successfully');
      }
      resetForm();
      loadContacts();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to save emergency contact';
      onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (contact: EmergencyContact) => {
    setFormData({
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      relationship: contact.relationship || '',
      primaryPhone: contact.primaryPhone || '',
      secondaryPhone: contact.secondaryPhone || '',
      email: contact.email || '',
      addressLine1: contact.addressLine1 || '',
      addressLine2: contact.addressLine2 || '',
      city: contact.city || '',
      state: contact.state || '',
      zipCode: contact.zipCode || '',
      country: contact.country || 'USA',
      isPrimary: contact.isPrimary || false,
    });
    setEditingId(contact.id || null);
    setShowAddForm(true);
  };

  const handleDelete = async (contactId: number) => {
    if (!window.confirm('Are you sure you want to delete this emergency contact?')) {
      return;
    }

    if (!patientId) {
      onError('Patient ID is required');
      return;
    }

    try {
      await profileService.deleteEmergencyContact(patientId, contactId);
      onSave('Emergency contact deleted successfully');
      loadContacts();
    } catch (err: any) {
      onError('Failed to delete emergency contact');
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      relationship: '',
      primaryPhone: '',
      secondaryPhone: '',
      email: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      isPrimary: false,
    });
    setErrors({});
    setEditingId(null);
    setShowAddForm(false);
    
    // Clear draft
    if (patientId) {
      localStorage.removeItem(`emergency-contact-draft-${patientId}`);
    }
  };

  // Load draft on mount
  useEffect(() => {
    if (patientId && !showAddForm) {
      const draft = localStorage.getItem(`emergency-contact-draft-${patientId}`);
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setFormData(parsed);
          setShowAddForm(true);
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }, [patientId, showAddForm]);

  const relationships = [
    'Spouse',
    'Parent',
    'Child',
    'Sibling',
    'Friend',
    'Other',
  ];

  return (
    <section
      data-testid="emergency-contacts-section"
      data-section="emergency-contacts"
      aria-labelledby="emergency-contacts-heading"
    >
      <div className="card">
        <div className="section-heading">
          <div>
            <h2 id="emergency-contacts-heading" data-testid="emergency-contacts-heading">
              Emergency Contacts
            </h2>
            <p className="muted" data-testid="emergency-contacts-description">
              Add emergency contacts who can be reached in case of an emergency (minimum 1 recommended, 2 preferred)
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
            data-testid="add-emergency-contact-btn"
            data-action="add-contact"
            aria-label="Add emergency contact"
          >
            Add Contact
          </button>
        </div>

        {showAddForm && (
          <div className="card" style={{ marginTop: '1rem' }} data-testid="emergency-contact-form-container">
            <h3 data-testid="emergency-contact-form-title">
              {editingId ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
            </h3>
            <form onSubmit={handleSubmit} data-testid="emergency-contact-form">
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
                    required
                    aria-required="true"
                    aria-invalid={errors.firstName ? 'true' : 'false'}
                    aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                    data-testid="contact-first-name-input"
                    className={errors.firstName ? 'error' : ''}
                  />
                  {errors.firstName && (
                    <span
                      id="firstName-error"
                      className="error-message"
                      data-testid="contact-first-name-error"
                      role="alert"
                    >
                      {errors.firstName}
                    </span>
                  )}
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
                    required
                    aria-required="true"
                    aria-invalid={errors.lastName ? 'true' : 'false'}
                    aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                    data-testid="contact-last-name-input"
                    className={errors.lastName ? 'error' : ''}
                  />
                  {errors.lastName && (
                    <span
                      id="lastName-error"
                      className="error-message"
                      data-testid="contact-last-name-error"
                      role="alert"
                    >
                      {errors.lastName}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="relationship" data-testid="relationship-label">
                    Relationship <span aria-label="required">*</span>
                  </label>
                  <select
                    id="relationship"
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    aria-invalid={errors.relationship ? 'true' : 'false'}
                    aria-describedby={errors.relationship ? 'relationship-error' : undefined}
                    data-testid="relationship-select"
                    className={errors.relationship ? 'error' : ''}
                  >
                    <option value="">Select Relationship</option>
                    {relationships.map(rel => (
                      <option key={rel} value={rel.toLowerCase()} data-testid={`relationship-option-${rel.toLowerCase()}`}>
                        {rel}
                      </option>
                    ))}
                  </select>
                  {errors.relationship && (
                    <span
                      id="relationship-error"
                      className="error-message"
                      data-testid="relationship-error"
                      role="alert"
                    >
                      {errors.relationship}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="primaryPhone" data-testid="contact-phone-label">
                    Primary Phone <span aria-label="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="primaryPhone"
                    name="primaryPhone"
                    value={formData.primaryPhone}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                    required
                    aria-required="true"
                    aria-invalid={errors.primaryPhone ? 'true' : 'false'}
                    aria-describedby={errors.primaryPhone ? 'primaryPhone-error' : undefined}
                    data-testid="contact-phone-input"
                    className={errors.primaryPhone ? 'error' : ''}
                  />
                  {errors.primaryPhone && (
                    <span
                      id="primaryPhone-error"
                      className="error-message"
                      data-testid="contact-phone-error"
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
                    placeholder="(555) 123-4567"
                    aria-invalid={errors.secondaryPhone ? 'true' : 'false'}
                    aria-describedby={errors.secondaryPhone ? 'secondaryPhone-error' : undefined}
                    data-testid="contact-secondary-phone-input"
                    className={errors.secondaryPhone ? 'error' : ''}
                  />
                  {errors.secondaryPhone && (
                    <span
                      id="secondaryPhone-error"
                      className="error-message"
                      data-testid="contact-secondary-phone-error"
                      role="alert"
                    >
                      {errors.secondaryPhone}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email" data-testid="contact-email-label">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    data-testid="contact-email-input"
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && (
                    <span
                      id="email-error"
                      className="error-message"
                      data-testid="contact-email-error"
                      role="alert"
                    >
                      {errors.email}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="addressLine1" data-testid="contact-address-label">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    data-testid="contact-address-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="addressLine2" data-testid="contact-address2-label">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    id="addressLine2"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    data-testid="contact-address2-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="city" data-testid="contact-city-label">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    data-testid="contact-city-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="state" data-testid="contact-state-label">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    data-testid="contact-state-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="zipCode" data-testid="contact-zip-label">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    data-testid="contact-zip-input"
                  />
                </div>

                <div className="form-group checkbox">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    name="isPrimary"
                    checked={formData.isPrimary || false}
                    onChange={handleChange}
                    data-testid="is-primary-checkbox"
                  />
                  <label htmlFor="isPrimary" data-testid="is-primary-label">
                    Set as primary emergency contact
                  </label>
                </div>
              </div>

              <div className="actions-row">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  data-testid="save-emergency-contact-btn"
                  data-action="save-emergency-contact"
                  aria-label="Save emergency contact"
                >
                  {loading ? 'Saving...' : 'Save Contact'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                  data-testid="cancel-emergency-contact-btn"
                  aria-label="Cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="emergency-contacts-list" data-testid="emergency-contacts-list" style={{ marginTop: '2rem' }}>
          {contacts.length === 0 ? (
            <div className="empty-state" data-testid="no-emergency-contacts-message">
              <p>No emergency contacts on file. Add at least one emergency contact above.</p>
            </div>
          ) : (
            contacts
              .sort((a, b) => {
                if (a.isPrimary) return -1;
                if (b.isPrimary) return 1;
                return 0;
              })
              .map((contact, index) => (
                <div
                  key={contact.id}
                  className="card"
                  data-testid={`emergency-contact-${contact.id}`}
                  data-contact-index={index}
                >
                  <div className="section-heading">
                    <div>
                      <h3 data-testid={`contact-name-${contact.id}`}>
                        {contact.firstName} {contact.lastName}
                        {contact.isPrimary && (
                          <span className="pill pill-success" style={{ marginLeft: '0.5rem' }}>
                            Primary
                          </span>
                        )}
                      </h3>
                      <p data-testid={`contact-relationship-${contact.id}`}>
                        Relationship: {contact.relationship}
                      </p>
                      <p data-testid={`contact-phone-${contact.id}`}>
                        Phone: {contact.primaryPhone}
                      </p>
                      {contact.email && (
                        <p data-testid={`contact-email-${contact.id}`}>
                          Email: {contact.email}
                        </p>
                      )}
                      {contact.addressLine1 && (
                        <p data-testid={`contact-address-${contact.id}`}>
                          Address: {contact.addressLine1} {contact.city && `, ${contact.city}`} {contact.state && `, ${contact.state}`} {contact.zipCode && ` ${contact.zipCode}`}
                        </p>
                      )}
                    </div>
                    <div className="detail-actions">
                      <button
                        type="button"
                        className="btn btn-secondary btn-compact"
                        onClick={() => handleEdit(contact)}
                        data-testid={`edit-contact-btn-${contact.id}`}
                        aria-label={`Edit ${contact.firstName} ${contact.lastName}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-compact"
                        onClick={() => contact.id && handleDelete(contact.id)}
                        data-testid={`delete-contact-btn-${contact.id}`}
                        aria-label={`Delete ${contact.firstName} ${contact.lastName}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </section>
  );
};

export default EmergencyContactsSection;

