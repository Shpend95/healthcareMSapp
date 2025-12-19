import React, { useState, useEffect } from 'react';
import { profileService } from '../../services/api';
import { validateRequired, validatePhone, validateEmail } from '../../utils/validation';
import { announceToScreenReader } from '../../utils/accessibility';

function EmergencyContactsSection({ patientId, profile, onSave, onError }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    address: '',
    priority: 'primary',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadContacts();
  }, [patientId]);

  const loadContacts = async () => {
    try {
      const response = await profileService.getEmergencyContacts(patientId);
      setContacts(response.data || []);
    } catch (err) {
      console.error('Error loading emergency contacts:', err);
    }
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Contact name is required';
    }
    if (!formData.relationship) {
      newErrors.relationship = 'Relationship is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneValidation = validatePhone(formData.phone);
      if (!phoneValidation.valid) {
        newErrors.phone = phoneValidation.message;
      }
    }
    if (formData.email && !validateEmail(formData.email).valid) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      announceToScreenReader('Please fix form errors before saving');
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
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to save emergency contact';
      onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (contact) => {
    setFormData({
      name: contact.name || '',
      relationship: contact.relationship || '',
      phone: contact.phone || '',
      email: contact.email || '',
      address: contact.address || '',
      priority: contact.priority || 'primary',
    });
    setEditingId(contact.id);
    setShowAddForm(true);
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this emergency contact?')) {
      return;
    }

    try {
      await profileService.deleteEmergencyContact(patientId, contactId);
      onSave('Emergency contact deleted successfully');
      loadContacts();
    } catch (err) {
      onError('Failed to delete emergency contact');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      phone: '',
      email: '',
      address: '',
      priority: 'primary',
    });
    setErrors({});
    setEditingId(null);
    setShowAddForm(false);
  };

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
                  <label htmlFor="contactName" data-testid="contact-name-label">
                    Full Name <span aria-label="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="contactName"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    aria-invalid={errors.name ? 'true' : 'false'}
                    data-testid="contact-name-input"
                    data-contact-index="0"
                    name="contactName"
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && (
                    <span className="error-message" data-testid="contact-name-error" role="alert">
                      {errors.name}
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
                    data-testid="relationship-select"
                    name="relationship"
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
                    <span className="error-message" data-testid="relationship-error" role="alert">
                      {errors.relationship}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="phone" data-testid="contact-phone-label">
                    Phone Number <span aria-label="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                    required
                    aria-required="true"
                    aria-invalid={errors.phone ? 'true' : 'false'}
                    data-testid="contact-phone-input"
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && (
                    <span className="error-message" data-testid="contact-phone-error" role="alert">
                      {errors.phone}
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
                    data-testid="contact-email-input"
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && (
                    <span className="error-message" data-testid="contact-email-error" role="alert">
                      {errors.email}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="address" data-testid="contact-address-label">
                    Address (Optional)
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    data-testid="contact-address-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="priority" data-testid="priority-label">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    data-testid="priority-select"
                  >
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                  </select>
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
                if (a.priority === 'primary') return -1;
                if (b.priority === 'primary') return 1;
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
                        {contact.name}
                        {contact.priority === 'primary' && (
                          <span className="pill pill-success" style={{ marginLeft: '0.5rem' }}>
                            Primary
                          </span>
                        )}
                      </h3>
                      <p data-testid={`contact-relationship-${contact.id}`}>
                        Relationship: {contact.relationship}
                      </p>
                      <p data-testid={`contact-phone-${contact.id}`}>
                        Phone: {contact.phone}
                      </p>
                      {contact.email && (
                        <p data-testid={`contact-email-${contact.id}`}>
                          Email: {contact.email}
                        </p>
                      )}
                      {contact.address && (
                        <p data-testid={`contact-address-${contact.id}`}>
                          Address: {contact.address}
                        </p>
                      )}
                    </div>
                    <div className="detail-actions">
                      <button
                        type="button"
                        className="btn btn-secondary btn-compact"
                        onClick={() => handleEdit(contact)}
                        data-testid={`edit-contact-btn-${contact.id}`}
                        aria-label={`Edit ${contact.name}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-compact"
                        onClick={() => handleDelete(contact.id)}
                        data-testid={`delete-contact-btn-${contact.id}`}
                        aria-label={`Delete ${contact.name}`}
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
}

export default EmergencyContactsSection;

