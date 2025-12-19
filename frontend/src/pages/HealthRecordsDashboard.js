import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { healthRecordService, testResultService } from '../services/api';
import { format } from 'date-fns';

function HealthRecordsDashboard() {
  const { user } = useAuth();
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [immunizations, setImmunizations] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [selectedTestType, setSelectedTestType] = useState('');
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.id) {
      loadAllData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedTestType && user?.id) {
      loadTrendData();
    }
  }, [selectedTestType, user]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [historyRes, immunizationsRes, allergiesRes, labRes] = await Promise.all([
        healthRecordService.getMedicalHistory(user.id),
        healthRecordService.getImmunizations(user.id),
        healthRecordService.getAllergies(user.id),
        healthRecordService.getLabResults(user.id),
      ]);

      setMedicalHistory(historyRes.data || []);
      setImmunizations(immunizationsRes.data || []);
      setAllergies(allergiesRes.data || []);
      setLabResults(labRes.data || []);
    } catch (err) {
      console.error('Error loading health records:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTrendData = async () => {
    try {
      const response = await healthRecordService.getLabResultTrends(user.id, selectedTestType);
      setTrendData(response.data || []);
    } catch (err) {
      console.error('Error loading trend data:', err);
    }
  };

  const testTypes = [...new Set(labResults.map(r => r.testType))];

  if (loading) {
    return (
      <div data-testid="health-records-page">
        <div className="loading" data-testid="health-records-loading">Loading health records...</div>
      </div>
    );
  }

  return (
    <div data-testid="health-records-page" className="health-records-page">
      <div className="page-header">
        <h1 data-testid="health-records-title">Health Records Dashboard</h1>
        <p data-testid="health-records-subtitle">View your comprehensive medical history and records</p>
      </div>

      <div className="tabs" data-testid="health-records-tabs" role="tablist">
        <button
          type="button"
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
          data-testid="tab-overview"
          role="tab"
          aria-selected={activeTab === 'overview'}
        >
          Overview
        </button>
        <button
          type="button"
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
          data-testid="tab-history"
          role="tab"
          aria-selected={activeTab === 'history'}
        >
          Medical History
        </button>
        <button
          type="button"
          className={activeTab === 'immunizations' ? 'active' : ''}
          onClick={() => setActiveTab('immunizations')}
          data-testid="tab-immunizations"
          role="tab"
          aria-selected={activeTab === 'immunizations'}
        >
          Immunizations
        </button>
        <button
          type="button"
          className={activeTab === 'allergies' ? 'active' : ''}
          onClick={() => setActiveTab('allergies')}
          data-testid="tab-allergies"
          role="tab"
          aria-selected={activeTab === 'allergies'}
        >
          Allergies
        </button>
        <button
          type="button"
          className={activeTab === 'lab-results' ? 'active' : ''}
          onClick={() => setActiveTab('lab-results')}
          data-testid="tab-lab-results"
          role="tab"
          aria-selected={activeTab === 'lab-results'}
        >
          Lab Results
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="overview-tab" data-testid="overview-content">
          <div className="dashboard-grid">
            <div className="card" data-testid="summary-card-history">
              <h3 data-testid="summary-history-title">Medical History</h3>
              <p className="stat-value" data-testid="summary-history-count">{medicalHistory.length}</p>
              <p className="muted">Records</p>
            </div>
            <div className="card" data-testid="summary-card-immunizations">
              <h3 data-testid="summary-immunizations-title">Immunizations</h3>
              <p className="stat-value" data-testid="summary-immunizations-count">{immunizations.length}</p>
              <p className="muted">Vaccines</p>
            </div>
            <div className="card" data-testid="summary-card-allergies">
              <h3 data-testid="summary-allergies-title">Allergies</h3>
              <p className="stat-value" data-testid="summary-allergies-count">{allergies.length}</p>
              <p className="muted">Known Allergies</p>
            </div>
            <div className="card" data-testid="summary-card-lab-results">
              <h3 data-testid="summary-lab-results-title">Lab Results</h3>
              <p className="stat-value" data-testid="summary-lab-results-count">{labResults.length}</p>
              <p className="muted">Test Results</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="history-tab" data-testid="history-content">
          <div className="card">
            <h2 data-testid="history-heading">Medical History Timeline</h2>
            {medicalHistory.length === 0 ? (
              <p className="muted" data-testid="no-history-message">No medical history records available</p>
            ) : (
              <div className="timeline" data-testid="history-timeline">
                {medicalHistory.map((record, index) => (
                  <div key={record.id || index} className="timeline-item" data-testid={`history-item-${record.id}`}>
                    <div className="timeline-date" data-testid={`history-date-${record.id}`}>
                      {format(new Date(record.date), 'MMM dd, yyyy')}
                    </div>
                    <div className="timeline-content">
                      <h4 data-testid={`history-title-${record.id}`}>{record.title || record.condition}</h4>
                      <p data-testid={`history-description-${record.id}`}>{record.description || record.notes}</p>
                      {record.provider && (
                        <p className="muted" data-testid={`history-provider-${record.id}`}>
                          Provider: {record.provider}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'immunizations' && (
        <div className="immunizations-tab" data-testid="immunizations-content">
          <div className="card">
            <h2 data-testid="immunizations-heading">Immunization Records</h2>
            {immunizations.length === 0 ? (
              <p className="muted" data-testid="no-immunizations-message">No immunization records available</p>
            ) : (
              <div className="immunizations-list" data-testid="immunizations-list">
                {immunizations.map((immunization) => (
                  <div key={immunization.id} className="card" data-testid={`immunization-${immunization.id}`}>
                    <h3 data-testid={`immunization-name-${immunization.id}`}>{immunization.vaccineName}</h3>
                    <p data-testid={`immunization-date-${immunization.id}`}>
                      Date: {format(new Date(immunization.date), 'MMM dd, yyyy')}
                    </p>
                    {immunization.nextDueDate && (
                      <p data-testid={`immunization-next-due-${immunization.id}`}>
                        Next Due: {format(new Date(immunization.nextDueDate), 'MMM dd, yyyy')}
                      </p>
                    )}
                    {immunization.location && (
                      <p className="muted" data-testid={`immunization-location-${immunization.id}`}>
                        Location: {immunization.location}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'allergies' && (
        <div className="allergies-tab" data-testid="allergies-content">
          <div className="card">
            <h2 data-testid="allergies-heading">Allergies</h2>
            {allergies.length === 0 ? (
              <p className="muted" data-testid="no-allergies-message">No known allergies recorded</p>
            ) : (
              <div className="allergies-list" data-testid="allergies-list">
                {allergies.map((allergy) => (
                  <div key={allergy.id} className="card" data-testid={`allergy-${allergy.id}`}>
                    <h3 data-testid={`allergy-name-${allergy.id}`}>{allergy.allergen}</h3>
                    <p data-testid={`allergy-severity-${allergy.id}`}>
                      Severity: {allergy.severity || 'Unknown'}
                    </p>
                    {allergy.reaction && (
                      <p data-testid={`allergy-reaction-${allergy.id}`}>
                        Reaction: {allergy.reaction}
                      </p>
                    )}
                    {allergy.notes && (
                      <p className="muted" data-testid={`allergy-notes-${allergy.id}`}>
                        Notes: {allergy.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'lab-results' && (
        <div className="lab-results-tab" data-testid="lab-results-content">
          <div className="card">
            <h2 data-testid="lab-results-heading">Lab Results</h2>
            
            {labResults.length > 0 && (
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="test-type-select" data-testid="test-type-label">
                  View Trends for Test Type
                </label>
                <select
                  id="test-type-select"
                  value={selectedTestType}
                  onChange={(e) => setSelectedTestType(e.target.value)}
                  data-testid="test-type-select"
                >
                  <option value="">Select test type</option>
                  {testTypes.map(type => (
                    <option key={type} value={type} data-testid={`test-type-option-${type}`}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedTestType && trendData.length > 0 && (
              <div className="card" style={{ marginBottom: '1rem' }} data-testid="trend-chart-container">
                <h3 data-testid="trend-chart-title">Trend: {selectedTestType}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#0066cc" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {labResults.length === 0 ? (
              <p className="muted" data-testid="no-lab-results-message">No lab results available</p>
            ) : (
              <div className="lab-results-list" data-testid="lab-results-list">
                {labResults.map((result) => (
                  <div key={result.id} className="card" data-testid={`lab-result-${result.id}`}>
                    <h3 data-testid={`lab-result-name-${result.id}`}>{result.testName || result.testType}</h3>
                    <p data-testid={`lab-result-date-${result.id}`}>
                      Date: {format(new Date(result.testDate), 'MMM dd, yyyy')}
                    </p>
                    <p data-testid={`lab-result-value-${result.id}`}>
                      Result: {result.resultValue} {result.unit}
                    </p>
                    {result.referenceRange && (
                      <p className="muted" data-testid={`lab-result-range-${result.id}`}>
                        Reference Range: {result.referenceRange}
                      </p>
                    )}
                    {result.status && (
                      <span className={`pill pill-${result.status.toLowerCase()}`} data-testid={`lab-result-status-${result.id}`}>
                        {result.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HealthRecordsDashboard;

