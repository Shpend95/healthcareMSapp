import React, { useState, useEffect } from 'react';
import { insuranceService } from '../../services/api';
import { validateFile, validateRequired } from '../../utils/validation';
import { announceToScreenReader } from '../../utils/accessibility';

function InsuranceSection({ patientId, profile, onSave, onError }) {
  const [insurancePlans, setInsurancePlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadingCard, setUploadingCard] = useState(false);
  const [formData, setFormData] = useState({
    providerName: '',
    policyId: '',
    groupNumber: '',
    policyholderName: '',
    relationship: 'self',
    effectiveDate: '',
    expirationDate: '',
    phone: '',
    coverageType: 'medical',
    planType: 'primary',
  });
  const [errors, setErrors] = useState({});
  const [cardFiles, setCardFiles] = useState({ front: null, back: null });

  useEffect(() => {
    loadInsurancePlans();
  }, [patientId]);

  const loadInsurancePlans = async () => {
    try {
      const response = await insuranceService.getByPatientId(patientId);
      setInsurancePlans(response.data || []);
    } catch (err) {
      console.error('Error loading insurance plans:', err);
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

  const handleFileChange = (side, file) => {
    const validation = validateFile(file, { maxSize: 10 * 1024 * 1024 });
    if (!validation.valid) {
      setErrors(prev => ({ ...prev, [`card${side}`]: validation.message }));
      return;
    }
    setCardFiles(prev => ({ ...prev, [side]: file }));
  };

  const handleUploadCard = async (planId, side) => {
    const file = cardFiles[side];
    if (!file) return;

    setUploadingCard(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('side', side);
      
      await insuranceService.uploadCard(patientId, formData);
      announceToScreenReader(`Insurance card ${side} uploaded successfully`);
      onSave(`Insurance card ${side} uploaded successfully`);
      setCardFiles(prev => ({ ...prev, [side]: null }));
      loadInsurancePlans();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to upload card';
      onError(errorMsg);
    } finally {
      setUploadingCard(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.providerName.trim()) {
      newErrors.providerName = 'Insurance provider name is required';
    }
    if (!formData.policyId.trim()) {
      newErrors.policyId = 'Policy/Member ID is required';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      await insuranceService.create({
        ...formData,
        patientId: parseInt(patientId),
      });
      announceToScreenReader('Insurance plan added successfully');
      onSave('Insurance plan added successfully');
      resetForm();
      loadInsurancePlans();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add insurance plan';
      onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      providerName: '',
      policyId: '',
      groupNumber: '',
      policyholderName: '',
      relationship: 'self',
      effectiveDate: '',
      expirationDate: '',
      phone: '',
      coverageType: 'medical',
      planType: 'primary',
    });
    setErrors({});
    setCardFiles({ front: null, back: null });
    setShowAddForm(false);
  };

  return (
    <section
      data-testid="insurance-section"
      data-section="insurance"
      aria-labelledby="insurance-heading"
    >
      <div className="card">
        <div className="section-heading">
          <div>
            <h2 id="insurance-heading" data-testid="insurance-heading">
              Insurance Information
            </h2>
            <p className="muted" data-testid="insurance-description">
              Manage your insurance plans and upload insurance cards
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
            data-testid="add-insurance-btn"
            data-action="add-insurance-plan"
            aria-label="Add insurance plan"
          >
            Add Insurance Plan
          </button>
        </div>

        {showAddForm && (
          <div className="card" style={{ marginTop: '1rem' }} data-testid="insurance-form-container">
            <h3 data-testid="insurance-form-title">Add Insurance Plan</h3>
            <form onSubmit={handleSubmit} data-testid="insurance-form" id="insurance-details">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="providerName" data-testid="provider-name-label">
                    Insurance Provider <span aria-label="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="providerName"
                    name="providerName"
                    value={formData.providerName}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    aria-invalid={errors.providerName ? 'true' : 'false'}
                    data-testid="provider-name-input"
                    data-field="providerName"
                    className={errors.providerName ? 'error' : ''}
                  />
                  {errors.providerName && (
                    <span className="error-message" data-testid="provider-name-error" role="alert">
                      {errors.providerName}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="policyId" data-testid="policy-id-label">
                    Policy/Member ID <span aria-label="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="policyId"
                    name="policyId"
                    value={formData.policyId}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    aria-invalid={errors.policyId ? 'true' : 'false'}
                    data-testid="policy-id-input"
                    className={errors.policyId ? 'error' : ''}
                  />
                  {errors.policyId && (
                    <span className="error-message" data-testid="policy-id-error" role="alert">
                      {errors.policyId}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="groupNumber" data-testid="group-number-label">
                    Group Number
                  </label>
                  <input
                    type="text"
                    id="groupNumber"
                    name="groupNumber"
                    value={formData.groupNumber}
                    onChange={handleChange}
                    data-testid="group-number-input"
                    data-field="groupNumber"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="policyholderName" data-testid="policyholder-name-label">
                    Policyholder Name
                  </label>
                  <input
                    type="text"
                    id="policyholderName"
                    name="policyholderName"
                    value={formData.policyholderName}
                    onChange={handleChange}
                    data-testid="policyholder-name-input"
                    data-field="policyholderName"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="relationship" data-testid="relationship-label">
                    Relationship to Policyholder
                  </label>
                  <select
                    id="relationship"
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleChange}
                    data-testid="relationship-select"
                    data-field="relationship"
                  >
                    <option value="self">Self</option>
                    <option value="spouse">Spouse</option>
                    <option value="child">Child</option>
                    <option value="parent">Parent</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="coverageType" data-testid="coverage-type-label">
                    Coverage Type
                  </label>
                  <select
                    id="coverageType"
                    name="coverageType"
                    value={formData.coverageType}
                    onChange={handleChange}
                    data-testid="coverage-type-select"
                    data-field="coverageType"
                  >
                    <option value="medical">Medical</option>
                    <option value="dental">Dental</option>
                    <option value="vision">Vision</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="planType" data-testid="plan-type-label">
                    Plan Type
                  </label>
                  <select
                    id="planType"
                    name="planType"
                    value={formData.planType}
                    onChange={handleChange}
                    data-testid="plan-type-select"
                    data-field="planType"
                  >
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="tertiary">Tertiary</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="effectiveDate" data-testid="effective-date-label">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    id="effectiveDate"
                    name="effectiveDate"
                    value={formData.effectiveDate}
                    onChange={handleChange}
                    data-testid="effective-date-input"
                    data-field="effectiveDate"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="expirationDate" data-testid="expiration-date-label">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    id="expirationDate"
                    name="expirationDate"
                    value={formData.expirationDate}
                    onChange={handleChange}
                    data-testid="expiration-date-input"
                    data-field="expirationDate"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone" data-testid="insurance-phone-label">
                    Insurance Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    data-testid="insurance-phone-input"
                    data-field="phone"
                  />
                </div>
              </div>

              <div className="actions-row">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  data-testid="save-insurance-btn"
                  data-action="save-insurance"
                  aria-label="Save insurance plan"
                >
                  {loading ? 'Saving...' : 'Save Insurance Plan'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                  data-testid="cancel-insurance-btn"
                  aria-label="Cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="upload-grid" style={{ marginTop: '2rem' }} data-testid="insurance-card-upload-section">
          <div className="upload-box" data-testid="card-front-upload">
            <h4 data-testid="card-front-title">Front of Insurance Card</h4>
            <div className="form-group">
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,application/pdf"
                onChange={(e) => handleFileChange('front', e.target.files[0])}
                data-testid="card-front-input"
                data-component="insurance-uploader"
                aria-label="Upload front of insurance card"
              />
              {cardFiles.front && (
                <div>
                  <p className="muted">{cardFiles.front.name}</p>
                  <button
                    type="button"
                    className="btn btn-primary btn-compact"
                    onClick={() => handleUploadCard(null, 'front')}
                    disabled={uploadingCard}
                    data-testid="upload-card-front-btn"
                    aria-label="Upload front card"
                  >
                    Upload
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="upload-box" data-testid="card-back-upload">
            <h4 data-testid="card-back-title">Back of Insurance Card</h4>
            <div className="form-group">
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,application/pdf"
                onChange={(e) => handleFileChange('back', e.target.files[0])}
                data-testid="card-back-input"
                data-component="insurance-uploader"
                aria-label="Upload back of insurance card"
              />
              {cardFiles.back && (
                <div>
                  <p className="muted">{cardFiles.back.name}</p>
                  <button
                    type="button"
                    className="btn btn-primary btn-compact"
                    onClick={() => handleUploadCard(null, 'back')}
                    disabled={uploadingCard}
                    data-testid="upload-card-back-btn"
                    aria-label="Upload back card"
                  >
                    Upload
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="insurance-plans-list" data-testid="insurance-plans-list" style={{ marginTop: '2rem' }}>
          {insurancePlans.length === 0 ? (
            <div className="empty-state" data-testid="no-insurance-message">
              <p>No insurance plans on file. Add your insurance plan above.</p>
            </div>
          ) : (
            insurancePlans.map((plan) => (
              <div key={plan.id} className="card" data-testid={`insurance-plan-${plan.id}`}>
                <h3 data-testid={`plan-provider-${plan.id}`}>{plan.providerName}</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Policy ID:</span>
                    <span className="value" data-testid={`plan-policy-id-${plan.id}`}>{plan.policyId}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Plan Type:</span>
                    <span className="value" data-testid={`plan-type-${plan.id}`}>{plan.planType}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Coverage:</span>
                    <span className="value" data-testid={`plan-coverage-${plan.id}`}>{plan.coverageType}</span>
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

export default InsuranceSection;

