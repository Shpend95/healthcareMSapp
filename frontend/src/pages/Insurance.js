import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { insuranceService, patientService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const providers = [
  'Aetna',
  'Blue Cross Blue Shield',
  'UnitedHealthcare',
  'Cigna',
  'Medicare',
  'Medicaid',
];

function Insurance() {
  const { user } = useAuth();
  const { patientId: urlPatientId } = useParams();
  const [patientId, setPatientId] = useState(null);
  const [insuranceList, setInsuranceList] = useState([]);
  const [currentInsurance, setCurrentInsurance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formState, setFormState] = useState({
    provider: 'Aetna',
    policyNumber: '',
    coverageType: 'PPO',
    expiryDate: '',
  });
  const [successMessage, setSuccessMessage] = useState('');

  // Find patient by email from logged-in user
  useEffect(() => {
    const findPatient = async () => {
      if (urlPatientId) {
        setPatientId(urlPatientId);
        return;
      }

      if (!user?.email) {
        setError('Please log in to view insurance');
        setLoading(false);
        return;
      }

      try {
        const patientsResponse = await patientService.getAll();
        const patients = patientsResponse.data;
        const patient = patients.find(p => p.email === user.email);
        
        if (patient) {
          setPatientId(patient.id.toString());
        } else {
          setError('Patient record not found. Please contact support.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error finding patient:', err);
        setError('Failed to load patient information');
        setLoading(false);
      }
    };

    findPatient();
  }, [user, urlPatientId]);

  // Load insurance when patientId is available
  useEffect(() => {
    if (!patientId) return;

    const loadInsurance = async () => {
      try {
        setLoading(true);
        const [allInsuranceResponse, currentInsuranceResponse] = await Promise.all([
          insuranceService.getByPatientId(patientId),
          insuranceService.getCurrentByPatientId(patientId).catch(() => ({ data: null }))
        ]);
        
        setInsuranceList(allInsuranceResponse.data || []);
        setCurrentInsurance(currentInsuranceResponse.data);
        setError('');
      } catch (err) {
        console.error('Error loading insurance:', err);
        setError('Failed to load insurance information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadInsurance();
  }, [patientId]);

  const statusClass = useMemo(
    () => {
      if (!currentInsurance) return 'pill-warning';
      const expiryDate = new Date(currentInsurance.expiryDate);
      const today = new Date();
      if (expiryDate > today) return 'pill-success';
      return 'pill-warning';
    },
    [currentInsurance]
  );

  const handleChange = (field) => (event) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!patientId) {
      setError('Patient ID not found');
      return;
    }

    try {
      await insuranceService.create({
        patientId: parseInt(patientId),
        provider: formState.provider,
        policyNumber: formState.policyNumber,
        coverageType: formState.coverageType,
        expiryDate: formState.expiryDate,
      });
      
      setSuccessMessage('Insurance information updated successfully.');
      
      // Reload insurance
      const [allInsuranceResponse, currentInsuranceResponse] = await Promise.all([
        insuranceService.getByPatientId(patientId),
        insuranceService.getCurrentByPatientId(patientId).catch(() => ({ data: null }))
      ]);
      
      setInsuranceList(allInsuranceResponse.data || []);
      setCurrentInsurance(currentInsuranceResponse.data);
      
      setFormState({
        provider: 'Aetna',
        policyNumber: '',
        coverageType: 'PPO',
        expiryDate: '',
      });
    } catch (err) {
      console.error('Error updating insurance:', err);
      setError('Failed to update insurance. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="insurance-page" data-testid="insurance-page">
        <div className="page-header">
          <h1>Insurance</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !insuranceList.length && !currentInsurance) {
    return (
      <div className="insurance-page" data-testid="insurance-page">
        <div className="page-header">
          <h1>Insurance</h1>
          <p className="error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="insurance-page" data-testid="insurance-page">
      <div className="page-header">
        <h1>Insurance</h1>
        <p>Manage your active plan, upload cards, and review coverage.</p>
      </div>

      {error && <div className="alert error">{error}</div>}
      {successMessage && <div className="alert success">{successMessage}</div>}

      <div className="insurance-grid">
        <section className="card insurance-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Current Insurance</p>
              <h3>{currentInsurance ? currentInsurance.provider : 'No Active Insurance'}</h3>
              {currentInsurance && (
                <p className="muted">{currentInsurance.coverageType}</p>
              )}
            </div>
            {currentInsurance && (
              <div className="status-badge">
                <span className={`pill ${statusClass}`}>
                  {new Date(currentInsurance.expiryDate) > new Date() ? 'Active' : 'Expired'}
                </span>
                <small className="muted">
                  Expires {new Date(currentInsurance.expiryDate).toLocaleDateString()}
                </small>
              </div>
            )}
          </div>

          {currentInsurance && (
            <div className="info-grid">
              <div className="info-item">
                <p className="label">Provider</p>
                <p className="value">{currentInsurance.provider}</p>
              </div>
              <div className="info-item">
                <p className="label">Policy #</p>
                <p className="value">{currentInsurance.policyNumber}</p>
              </div>
              <div className="info-item">
                <p className="label">Coverage Type</p>
                <p className="value">{currentInsurance.coverageType}</p>
              </div>
              <div className="info-item">
                <p className="label">Expiry Date</p>
                <p className="value">{new Date(currentInsurance.expiryDate).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </section>

        <section className="card insurance-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Add/Update Insurance</p>
              <h3>Update your coverage</h3>
              <p className="muted">Enter your insurance information.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
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
                <label htmlFor="coverageType">Coverage Type</label>
                <select id="coverageType" value={formState.coverageType} onChange={handleChange('coverageType')}>
                  <option value="PPO">PPO</option>
                  <option value="HMO">HMO</option>
                  <option value="EPO">EPO</option>
                  <option value="POS">POS</option>
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
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="expiryDate">Expiry date</label>
                <input
                  id="expiryDate"
                  type="date"
                  value={formState.expiryDate}
                  onChange={handleChange('expiryDate')}
                  required
                />
              </div>
            </div>

            <div className="actions-row">
              <button className="btn btn-primary" type="submit">
                Submit
              </button>
            </div>
          </form>
        </section>
      </div>

      {insuranceList.length > 0 && (
        <section className="card insurance-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Insurance History</p>
              <h3>All Insurance Records</h3>
            </div>
          </div>
          <div className="table-wrapper">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Policy Number</th>
                  <th>Coverage Type</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {insuranceList.map((ins) => (
                  <tr key={ins.id}>
                    <td>{ins.provider}</td>
                    <td>{ins.policyNumber}</td>
                    <td>{ins.coverageType}</td>
                    <td>{new Date(ins.expiryDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`pill ${new Date(ins.expiryDate) > new Date() ? 'pill-success' : 'pill-warning'}`}>
                        {new Date(ins.expiryDate) > new Date() ? 'Active' : 'Expired'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export default Insurance;
