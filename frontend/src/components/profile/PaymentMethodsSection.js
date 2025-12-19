import React, { useState, useEffect } from 'react';
import { profileService } from '../../services/api';
import { validateCardNumber, validateCVV, validateZIP, validateRoutingNumber, validateAccountNumber, maskCardNumber } from '../../utils/validation';
import { announceToScreenReader } from '../../utils/accessibility';

function PaymentMethodsSection({ patientId, profile, onSave, onError }) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [paymentType, setPaymentType] = useState('card');
  const [formData, setFormData] = useState({
    type: 'card',
    cardNumber: '',
    cardholderName: '',
    expirationDate: '',
    cvv: '',
    billingZip: '',
    routingNumber: '',
    accountNumber: '',
    accountType: 'checking',
    bankName: '',
    isDefault: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadPaymentMethods();
  }, [patientId]);

  const loadPaymentMethods = async () => {
    try {
      const response = await profileService.getPaymentMethods(patientId);
      setPaymentMethods(response.data || []);
    } catch (err) {
      console.error('Error loading payment methods:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
    
    if (paymentType === 'card') {
      const cardValidation = validateCardNumber(formData.cardNumber);
      if (!cardValidation.valid) newErrors.cardNumber = cardValidation.message;
      
      if (!formData.cardholderName.trim()) {
        newErrors.cardholderName = 'Cardholder name is required';
      }
      
      const cvvValidation = validateCVV(formData.cvv);
      if (!cvvValidation.valid) newErrors.cvv = cvvValidation.message;
      
      const zipValidation = validateZIP(formData.billingZip);
      if (!zipValidation.valid) newErrors.billingZip = zipValidation.message;
      
      if (!formData.expirationDate) {
        newErrors.expirationDate = 'Expiration date is required';
      }
    } else {
      const routingValidation = validateRoutingNumber(formData.routingNumber);
      if (!routingValidation.valid) newErrors.routingNumber = routingValidation.message;
      
      const accountValidation = validateAccountNumber(formData.accountNumber);
      if (!accountValidation.valid) newErrors.accountNumber = accountValidation.message;
      
      if (!formData.bankName.trim()) {
        newErrors.bankName = 'Bank name is required';
      }
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
      await profileService.addPaymentMethod(patientId, formData);
      if (formData.isDefault) {
        // Set as default after adding
        const methods = await profileService.getPaymentMethods(patientId);
        const newMethod = methods.data[methods.data.length - 1];
        await profileService.setDefaultPaymentMethod(patientId, newMethod.id);
      }
      announceToScreenReader('Payment method added successfully');
      onSave('Payment method added successfully');
      resetForm();
      loadPaymentMethods();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add payment method';
      onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (methodId) => {
    try {
      await profileService.setDefaultPaymentMethod(patientId, methodId);
      onSave('Default payment method updated');
      loadPaymentMethods();
    } catch (err) {
      onError('Failed to set default payment method');
    }
  };

  const handleDelete = async (methodId) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      await profileService.deletePaymentMethod(patientId, methodId);
      onSave('Payment method deleted successfully');
      loadPaymentMethods();
    } catch (err) {
      onError('Failed to delete payment method');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'card',
      cardNumber: '',
      cardholderName: '',
      expirationDate: '',
      cvv: '',
      billingZip: '',
      routingNumber: '',
      accountNumber: '',
      accountType: 'checking',
      bankName: '',
      isDefault: false,
    });
    setErrors({});
    setPaymentType('card');
    setShowAddForm(false);
  };

  return (
    <section
      data-testid="payment-methods-section"
      data-section="payment-methods"
      aria-labelledby="payment-methods-heading"
    >
      <div className="card">
        <div className="section-heading">
          <div>
            <h2 id="payment-methods-heading" data-testid="payment-methods-heading">
              Payment Methods
            </h2>
            <p className="muted" data-testid="payment-methods-description">
              Manage your payment methods for bill payments
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
            data-testid="add-payment-method-btn"
            data-action="add-card"
            aria-label="Add payment method"
          >
            Add Payment Method
          </button>
        </div>

        {showAddForm && (
          <div className="card" style={{ marginTop: '1rem' }} data-testid="payment-form-container">
            <h3 data-testid="payment-form-title">Add Payment Method</h3>
            
            <div className="method-grid" style={{ marginBottom: '1rem' }}>
              <button
                type="button"
                className={`method-pill ${paymentType === 'card' ? 'selected' : ''}`}
                onClick={() => setPaymentType('card')}
                data-testid="select-card-type"
                aria-label="Select credit card"
              >
                Credit/Debit Card
              </button>
              <button
                type="button"
                className={`method-pill ${paymentType === 'ach' ? 'selected' : ''}`}
                onClick={() => setPaymentType('ach')}
                data-testid="select-ach-type"
                aria-label="Select bank account"
              >
                Bank Account (ACH)
              </button>
            </div>

            <form onSubmit={handleSubmit} data-testid="payment-form" data-payment-type={paymentType}>
              {paymentType === 'card' ? (
                <>
                  <div className="form-group">
                    <label htmlFor="cardNumber" data-testid="card-number-label">
                      Card Number <span aria-label="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      placeholder="1234 5678 9012 3456"
                      required
                      aria-required="true"
                      aria-invalid={errors.cardNumber ? 'true' : 'false'}
                      data-testid="card-number-input"
                      name="cardNumber"
                      className={errors.cardNumber ? 'error' : ''}
                      maxLength="19"
                    />
                    {errors.cardNumber && (
                      <span className="error-message" data-testid="card-number-error" role="alert">
                        {errors.cardNumber}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="cardholderName" data-testid="cardholder-name-label">
                      Cardholder Name <span aria-label="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="cardholderName"
                      name="cardholderName"
                      value={formData.cardholderName}
                      onChange={handleChange}
                      required
                      aria-required="true"
                      data-testid="cardholder-name-input"
                      name="cardholderName"
                      className={errors.cardholderName ? 'error' : ''}
                    />
                    {errors.cardholderName && (
                      <span className="error-message" data-testid="cardholder-name-error" role="alert">
                        {errors.cardholderName}
                      </span>
                    )}
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="expirationDate" data-testid="expiration-date-label">
                        Expiration Date <span aria-label="required">*</span>
                      </label>
                      <input
                        type="month"
                        id="expirationDate"
                        name="expirationDate"
                        value={formData.expirationDate}
                        onChange={handleChange}
                        required
                        aria-required="true"
                        data-testid="expiration-date-input"
                        className={errors.expirationDate ? 'error' : ''}
                      />
                      {errors.expirationDate && (
                        <span className="error-message" data-testid="expiration-date-error" role="alert">
                          {errors.expirationDate}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="cvv" data-testid="cvv-label">
                        CVV <span aria-label="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleChange}
                        placeholder="123"
                        required
                        aria-required="true"
                        maxLength="4"
                        data-testid="cvv-input"
                        name="cvv"
                        className={errors.cvv ? 'error' : ''}
                      />
                      {errors.cvv && (
                        <span className="error-message" data-testid="cvv-error" role="alert">
                          {errors.cvv}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="billingZip" data-testid="billing-zip-label">
                        Billing ZIP <span aria-label="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="billingZip"
                        name="billingZip"
                        value={formData.billingZip}
                        onChange={handleChange}
                        placeholder="12345"
                        required
                        aria-required="true"
                        data-testid="billing-zip-input"
                        className={errors.billingZip ? 'error' : ''}
                      />
                      {errors.billingZip && (
                        <span className="error-message" data-testid="billing-zip-error" role="alert">
                          {errors.billingZip}
                        </span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label htmlFor="bankName" data-testid="bank-name-label">
                      Bank Name <span aria-label="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="bankName"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      required
                      aria-required="true"
                      data-testid="bank-name-input"
                      className={errors.bankName ? 'error' : ''}
                    />
                    {errors.bankName && (
                      <span className="error-message" data-testid="bank-name-error" role="alert">
                        {errors.bankName}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="routingNumber" data-testid="routing-number-label">
                      Routing Number <span aria-label="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="routingNumber"
                      name="routingNumber"
                      value={formData.routingNumber}
                      onChange={handleChange}
                      placeholder="123456789"
                      required
                      aria-required="true"
                      maxLength="9"
                      data-testid="routing-number-input"
                      className={errors.routingNumber ? 'error' : ''}
                    />
                    {errors.routingNumber && (
                      <span className="error-message" data-testid="routing-number-error" role="alert">
                        {errors.routingNumber}
                      </span>
                    )}
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="accountNumber" data-testid="account-number-label">
                        Account Number <span aria-label="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="accountNumber"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        required
                        aria-required="true"
                        data-testid="account-number-input"
                        className={errors.accountNumber ? 'error' : ''}
                      />
                      {errors.accountNumber && (
                        <span className="error-message" data-testid="account-number-error" role="alert">
                          {errors.accountNumber}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="accountType" data-testid="account-type-label">
                        Account Type
                      </label>
                      <select
                        id="accountType"
                        name="accountType"
                        value={formData.accountType}
                        onChange={handleChange}
                        data-testid="account-type-select"
                      >
                        <option value="checking">Checking</option>
                        <option value="savings">Savings</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  data-testid="set-default-checkbox"
                />
                <label htmlFor="isDefault" data-testid="set-default-label">
                  Set as default payment method
                </label>
              </div>

              <div className="actions-row">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  data-testid="save-payment-method-btn"
                  data-action="save-payment-method"
                  aria-label="Save payment method"
                >
                  {loading ? 'Saving...' : 'Save Payment Method'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                  data-testid="cancel-payment-btn"
                  aria-label="Cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="payment-methods-list" data-testid="payment-methods-list" style={{ marginTop: '2rem' }}>
          {paymentMethods.length === 0 ? (
            <div className="empty-state" data-testid="no-payment-methods-message">
              <p>No payment methods on file. Add a payment method above.</p>
            </div>
          ) : (
            paymentMethods.map((method) => (
              <div key={method.id} className="card" data-testid={`payment-method-${method.id}`} data-card-id={method.id}>
                <div className="section-heading">
                  <div>
                    <h3 data-testid={`method-type-${method.id}`}>
                      {method.type === 'card' ? 'Credit/Debit Card' : 'Bank Account'}
                    </h3>
                    {method.type === 'card' ? (
                      <p data-testid={`method-card-number-${method.id}`}>
                        {maskCardNumber(method.cardNumber)}
                      </p>
                    ) : (
                      <p data-testid={`method-bank-${method.id}`}>
                        {method.bankName} • ••••{method.accountNumber?.slice(-4)}
                      </p>
                    )}
                    {method.isDefault && (
                      <span className="pill pill-success" data-testid={`method-default-badge-${method.id}`}>
                        Default
                      </span>
                    )}
                  </div>
                  <div className="detail-actions">
                    {!method.isDefault && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-compact"
                        onClick={() => handleSetDefault(method.id)}
                        data-testid={`set-default-btn-${method.id}`}
                        aria-label="Set as default"
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-danger btn-compact"
                      onClick={() => handleDelete(method.id)}
                      data-testid={`delete-payment-method-btn-${method.id}`}
                      data-card-id={method.id}
                      aria-label="Delete payment method"
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

export default PaymentMethodsSection;

