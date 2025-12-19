import React, { useState, useEffect } from 'react';
import { profileService } from '../../services/api';
import { validateRequired, validateZIP } from '../../utils/validation';
import { announceToScreenReader } from '../../utils/accessibility';

function AddressSection({ patientId, profile, onSave, onError }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: 'residential',
    street1: '',
    street2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (profile && profile.addresses) {
      setAddresses(profile.addresses);
    }
  }, [profile]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.street1.trim()) {
      newErrors.street1 = 'Street address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state) {
      newErrors.state = 'State is required';
    }
    const zipValidation = validateZIP(formData.zip);
    if (!zipValidation.valid) {
      newErrors.zip = zipValidation.message;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      announceToScreenReader('Please fix form errors before saving');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await profileService.updateAddress(patientId, editingId, formData);
        announceToScreenReader('Address updated successfully');
        onSave('Address updated successfully');
      } else {
        await profileService.addAddress(patientId, formData);
        announceToScreenReader('Address added successfully');
        onSave('Address added successfully');
      }
      
      resetForm();
      // Reload addresses
      const response = await profileService.getProfile(patientId);
      setAddresses(response.data.addresses || []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to save address';
      announceToScreenReader(errorMsg);
      onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address) => {
    setFormData({
      type: address.type || 'residential',
      street1: address.street1 || '',
      street2: address.street2 || '',
      city: address.city || '',
      state: address.state || '',
      zip: address.zip || '',
      country: address.country || 'US',
    });
    setEditingId(address.id);
    setShowAddForm(true);
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      await profileService.deleteAddress(patientId, addressId);
      announceToScreenReader('Address deleted successfully');
      onSave('Address deleted successfully');
      const response = await profileService.getProfile(patientId);
      setAddresses(response.data.addresses || []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete address';
      onError(errorMsg);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'residential',
      street1: '',
      street2: '',
      city: '',
      state: '',
      zip: '',
      country: 'US',
    });
    setErrors({});
    setEditingId(null);
    setShowAddForm(false);
  };

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <section
      data-testid="address-section"
      data-section="addresses"
      aria-labelledby="address-heading"
    >
      <div className="card">
        <div className="section-heading">
          <div>
            <h2 id="address-heading" data-testid="address-heading">
              Addresses
            </h2>
            <p className="muted" data-testid="address-description">
              Manage your residential and mailing addresses
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
            data-testid="add-address-btn"
            data-action="add-address"
            aria-label="Add new address"
          >
            Add Address
          </button>
        </div>

        {showAddForm && (
          <div className="card" style={{ marginTop: '1rem' }} data-testid="address-form-container">
            <h3 data-testid="address-form-title">
              {editingId ? 'Edit Address' : 'Add New Address'}
            </h3>
            <form onSubmit={handleSubmit} data-testid="address-form" data-form-type="address">
              <div className="form-group">
                <label htmlFor="address-type" data-testid="address-type-label">
                  Address Type <span aria-label="required">*</span>
                </label>
                <select
                  id="address-type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  data-testid="address-type-select"
                  data-field="addressType"
                >
                  <option value="residential">Residential</option>
                  <option value="mailing">Mailing</option>
                  <option value="previous">Previous</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="street1" data-testid="street1-label">
                  Street Address 1 <span aria-label="required">*</span>
                </label>
                <input
                  type="text"
                  id="street1"
                  name="street1"
                  value={formData.street1}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-invalid={errors.street1 ? 'true' : 'false'}
                  aria-describedby={errors.street1 ? 'street1-error' : undefined}
                  data-testid="street1-input"
                  data-field="street1"
                  className={errors.street1 ? 'error' : ''}
                />
                {errors.street1 && (
                  <span
                    id="street1-error"
                    className="error-message"
                    data-testid="street1-error"
                    data-field-error="street1"
                    role="alert"
                  >
                    {errors.street1}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="street2" data-testid="street2-label">
                  Street Address 2 (Apt/Unit)
                </label>
                <input
                  type="text"
                  id="street2"
                  name="street2"
                  value={formData.street2}
                  onChange={handleChange}
                  data-testid="street2-input"
                  data-field="street2"
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="city" data-testid="city-label">
                    City <span aria-label="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    aria-invalid={errors.city ? 'true' : 'false'}
                    aria-describedby={errors.city ? 'city-error' : undefined}
                    data-testid="city-input"
                    data-field="city"
                    className={errors.city ? 'error' : ''}
                  />
                  {errors.city && (
                    <span
                      id="city-error"
                      className="error-message"
                      data-testid="city-error"
                      data-field-error="city"
                      role="alert"
                    >
                      {errors.city}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="state" data-testid="state-label">
                    State <span aria-label="required">*</span>
                  </label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    aria-invalid={errors.state ? 'true' : 'false'}
                    aria-describedby={errors.state ? 'state-error' : undefined}
                    data-testid="state-select"
                    data-field="state"
                    className={errors.state ? 'error' : ''}
                  >
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state} value={state} data-testid={`state-option-${state}`}>
                        {state}
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <span
                      id="state-error"
                      className="error-message"
                      data-testid="state-error"
                      data-field-error="state"
                      role="alert"
                    >
                      {errors.state}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="zip" data-testid="zip-label">
                    ZIP Code <span aria-label="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="zip"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    aria-invalid={errors.zip ? 'true' : 'false'}
                    aria-describedby={errors.zip ? 'zip-error' : undefined}
                    data-testid="zip-input"
                    data-field="zip"
                    className={errors.zip ? 'error' : ''}
                    pattern="[0-9]{5}(-[0-9]{4})?"
                    placeholder="12345"
                  />
                  {errors.zip && (
                    <span
                      id="zip-error"
                      className="error-message"
                      data-testid="zip-error"
                      data-field-error="zip"
                      role="alert"
                    >
                      {errors.zip}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="country" data-testid="country-label">
                    Country
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    data-testid="country-select"
                    data-field="country"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="MX">Mexico</option>
                  </select>
                </div>
              </div>

              <div className="actions-row">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  data-testid="save-address-btn"
                  data-action="save-address"
                  aria-label="Save address"
                >
                  {loading ? 'Saving...' : 'Save Address'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                  data-testid="cancel-address-btn"
                  data-action="cancel-address"
                  aria-label="Cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="addresses-list" data-testid="addresses-list" style={{ marginTop: '2rem' }}>
          {addresses.length === 0 ? (
            <div className="empty-state" data-testid="no-addresses-message">
              <p>No addresses on file. Add your first address above.</p>
            </div>
          ) : (
            addresses.map((address) => (
              <div
                key={address.id}
                className="card"
                data-testid={`address-card-${address.id}`}
                data-address-id={address.id}
              >
                <div className="section-heading">
                  <div>
                    <h3 data-testid={`address-type-${address.id}`}>
                      {address.type === 'residential' ? 'Residential Address' :
                       address.type === 'mailing' ? 'Mailing Address' : 'Previous Address'}
                    </h3>
                    <p data-testid={`address-full-${address.id}`}>
                      {address.street1}
                      {address.street2 && `, ${address.street2}`}
                      <br />
                      {address.city}, {address.state} {address.zip}
                      <br />
                      {address.country}
                    </p>
                  </div>
                  <div className="detail-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-compact"
                      onClick={() => handleEdit(address)}
                      data-testid={`edit-address-btn-${address.id}`}
                      data-action={`edit-address-${address.id}`}
                      aria-label={`Edit ${address.type} address`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-compact"
                      onClick={() => handleDelete(address.id)}
                      data-testid={`delete-address-btn-${address.id}`}
                      data-action={`delete-address-${address.id}`}
                      aria-label={`Delete ${address.type} address`}
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

export default AddressSection;

