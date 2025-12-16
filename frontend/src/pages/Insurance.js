import React, { useMemo, useState } from 'react';

const providers = [
  'Aetna',
  'Blue Cross Blue Shield',
  'UnitedHealthcare',
  'Cigna',
  'Medicare',
  'Medicaid',
];

const planLevels = ['Bronze', 'Silver', 'Gold', 'Platinum'];

const currentInsurance = {
  provider: 'Blue Cross Blue Shield',
  planName: 'Silver Plan',
  policyNumber: 'BC123456',
  groupNumber: 'BC-GRP-7821',
  expiry: '12/2025',
  status: 'Active',
};

const benefits = {
  copay: '$25 per visit',
  deductible: '$1,500 individual',
  oopMax: '$6,000 individual',
  coveredServices: [
    'Primary and specialist visits',
    'Urgent care and ER services',
    'Preventive screenings & vaccines',
    'Diagnostic lab and imaging',
    'Prescription medications (tiered)',
  ],
};

function Insurance() {
  const [formState, setFormState] = useState({
    provider: 'Aetna',
    planLevel: 'Bronze',
    policyNumber: '',
    groupNumber: '',
    effectiveDate: '',
  });

  const statusClass = useMemo(
    () => (currentInsurance.status === 'Active' ? 'pill-success' : 'pill-warning'),
    []
  );

  const handleChange = (field) => (event) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  return (
    <div className="insurance-page" data-testid="insurance-page">
      <div className="page-header">
        <h1>Insurance</h1>
        <p>Manage your active plan, upload cards, and review coverage.</p>
      </div>

      <div className="insurance-grid">
        <section className="card insurance-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Current Insurance Card</p>
              <h3>{currentInsurance.planName}</h3>
              <p className="muted">{currentInsurance.provider}</p>
            </div>
            <div className="status-badge">
              <span className={`pill ${statusClass}`}>{currentInsurance.status}</span>
              <small className="muted">Expires {currentInsurance.expiry}</small>
            </div>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <p className="label">Provider</p>
              <p className="value">{currentInsurance.provider}</p>
            </div>
            <div className="info-item">
              <p className="label">Plan Name</p>
              <p className="value">{currentInsurance.planName}</p>
            </div>
            <div className="info-item">
              <p className="label">Policy #</p>
              <p className="value">{currentInsurance.policyNumber}</p>
            </div>
            <div className="info-item">
              <p className="label">Group #</p>
              <p className="value">{currentInsurance.groupNumber}</p>
            </div>
            <div className="info-item">
              <p className="label">Expiry Date</p>
              <p className="value">{currentInsurance.expiry}</p>
            </div>
          </div>

          <div className="upload-grid">
            <div className="upload-box">
              <p className="label">Card Image (Front)</p>
              <p className="muted">PNG or JPG up to 10MB.</p>
              <input type="file" accept="image/*" />
            </div>
            <div className="upload-box">
              <p className="label">Card Image (Back)</p>
              <p className="muted">PNG or JPG up to 10MB.</p>
              <input type="file" accept="image/*" />
            </div>
          </div>
        </section>

        <section className="card insurance-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Change Insurance</p>
              <h3>Update your coverage</h3>
              <p className="muted">Select a new provider and upload your card.</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="provider">Provider</label>
              <select id="provider" value={formState.provider} onChange={handleChange('provider')}>
                {providers.map((provider) => (
                  <option key={provider} value={provider}>
                    {provider}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="planLevel">Plan Level</label>
              <select id="planLevel" value={formState.planLevel} onChange={handleChange('planLevel')}>
                {planLevels.map((plan) => (
                  <option key={plan} value={plan}>
                    {plan}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="policyNumber">Policy number</label>
              <input
                id="policyNumber"
                type="text"
                placeholder="e.g. ABC123456"
                value={formState.policyNumber}
                onChange={handleChange('policyNumber')}
              />
            </div>

            <div className="field">
              <label htmlFor="groupNumber">Group number</label>
              <input
                id="groupNumber"
                type="text"
                placeholder="e.g. GRP-7788"
                value={formState.groupNumber}
                onChange={handleChange('groupNumber')}
              />
            </div>

            <div className="field">
              <label htmlFor="effectiveDate">Effective date</label>
              <input
                id="effectiveDate"
                type="date"
                value={formState.effectiveDate}
                onChange={handleChange('effectiveDate')}
              />
            </div>
          </div>

          <div className="upload-grid">
            <div className="upload-box">
              <p className="label">New Card (Front)</p>
              <input type="file" accept="image/*" />
            </div>
            <div className="upload-box">
              <p className="label">New Card (Back)</p>
              <input type="file" accept="image/*" />
            </div>
          </div>

          <div className="actions-row">
            <button className="btn btn-primary" type="button">
              Submit change
            </button>
            <button className="btn btn-secondary" type="button">
              Save for later
            </button>
          </div>
        </section>
      </div>

      <section className="card insurance-section benefits-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Insurance Benefits</p>
            <h3>Coverage details</h3>
            <p className="muted">Understand what your plan includes.</p>
          </div>
        </div>

        <div className="benefit-stats">
          <div className="stat-card">
            <p className="label">Copay</p>
            <p className="value">{benefits.copay}</p>
          </div>
          <div className="stat-card">
            <p className="label">Deductible</p>
            <p className="value">{benefits.deductible}</p>
          </div>
          <div className="stat-card">
            <p className="label">Out-of-pocket max</p>
            <p className="value">{benefits.oopMax}</p>
          </div>
        </div>

        <div className="covered-services">
          <h4>Covered services</h4>
          <ul>
            {benefits.coveredServices.map((service) => (
              <li key={service}>{service}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

export default Insurance;

