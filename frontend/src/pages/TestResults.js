import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { testResultService, patientService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusClassMap = {
  Normal: 'status-normal',
  Abnormal: 'status-high',
  Borderline: 'status-borderline',
  High: 'status-high',
  Low: 'status-low',
};

const sorters = {
  'date-desc': (a, b) => new Date(b.testDate) - new Date(a.testDate),
  'date-asc': (a, b) => new Date(a.testDate) - new Date(b.testDate),
  name: (a, b) => a.testName.localeCompare(b.testName),
  result: (a, b) => a.result.localeCompare(b.result),
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function TestResults() {
  const { user } = useAuth();
  const { patientId: urlPatientId } = useParams();
  const [patientId, setPatientId] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [selectedResult, setSelectedResult] = useState(null);

  // Find patient by userId from logged-in user
  useEffect(() => {
    const findPatient = async () => {
      if (urlPatientId) {
        setPatientId(urlPatientId);
        return;
      }

      if (!user?.id) {
        setError('Please log in to view test results');
        setLoading(false);
        return;
      }

      try {
        const patientResponse = await patientService.getByUserId(user.id);
        const patient = patientResponse.data;
        
        if (patient && patient.id) {
          setPatientId(patient.id.toString());
        } else {
          setError('Patient record not found. Please contact support.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error finding patient:', err);
        // Don't block the page - show error but allow user to see UI
        const errorMessage = err.response?.data?.message || 'Failed to load patient information. Please try again.';
        setError(errorMessage);
        setLoading(false);
        // DON'T call logout - let user stay logged in
      }
    };

    findPatient();
  }, [user, urlPatientId]);

  // Load test results when patientId is available
  useEffect(() => {
    if (!patientId) return;

    const loadTestResults = async () => {
      try {
        setLoading(true);
        setError(''); // Clear previous errors
        const response = await testResultService.getByPatientId(patientId);
        setTestResults(response.data || []);
      } catch (err) {
        console.error('Error loading test results:', err);
        // Show error but don't block the UI - user can still see filters
        const errorMessage = err.response?.data?.message || 'Failed to load test results. Please try again.';
        setError(errorMessage);
        // DON'T call logout - let user stay logged in
      } finally {
        setLoading(false);
      }
    };

    loadTestResults();
  }, [patientId]);

  const filteredResults = useMemo(() => {
    return testResults
      .filter((result) => result.testName?.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((result) => {
        if (!startDate && !endDate) return true;
        const resultDate = new Date(result.testDate);
        if (startDate && resultDate < new Date(startDate)) return false;
        if (endDate && resultDate > new Date(endDate)) return false;
        return true;
      })
      .sort(sorters[sortBy] || sorters['date-desc']);
  }, [testResults, searchTerm, startDate, endDate, sortBy]);

  useEffect(() => {
    if (!filteredResults.length) {
      setSelectedResult(null);
      return;
    }

    if (!selectedResult || !filteredResults.some((item) => item.id === selectedResult.id)) {
      setSelectedResult(filteredResults[0]);
    }
  }, [filteredResults, selectedResult]);

  const handleDownload = (result) => {
    const printable = [
      `Test Result: ${result.testName}`,
      `Result: ${result.result}`,
      `Date: ${formatDate(result.testDate)}`,
      `Notes: ${result.notes || 'No additional notes'}`,
    ].join('\n');

    const blob = new Blob([printable], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${result.testName?.replace(/\s+/g, '-').toLowerCase()}-${result.testDate}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const statusChip = (result) => {
    const status = result.result || 'Unknown';
    return <span className={`status-chip ${statusClassMap[status] || ''}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div data-testid="test-results-page">
        <div className="page-header">
          <h1>Test Results</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !testResults.length) {
    return (
      <div data-testid="test-results-page">
        <div className="page-header">
          <h1>Test Results</h1>
          <p className="error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="test-results-page">
      <div className="page-header">
        <h1>Test Results</h1>
        <p>Your latest laboratory results, filters, and trends at a glance.</p>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="card filters-card">
        <div className="filters-row">
          <div className="field">
            <label htmlFor="search">Search by test</label>
            <input
              id="search"
              type="text"
              placeholder="e.g. Blood Test"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="start-date">Start date</label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="end-date">End date</label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="sort">Sort by</label>
            <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date-desc">Date (newest)</option>
              <option value="date-asc">Date (oldest)</option>
              <option value="name">Test name</option>
              <option value="result">Result</option>
            </select>
          </div>
        </div>
      </div>

      <div className="results-layout">
        <div className="card results-card">
          <div className="table-header">
            <h3>Results</h3>
            <span className="muted">{filteredResults.length} records</span>
          </div>

          <div className="table-wrapper">
            <table className="results-table" data-testid="results-table">
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Result</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      <p className="muted">No test results found.</p>
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((result) => (
                    <tr
                      key={result.id}
                      className={selectedResult?.id === result.id ? 'row-selected' : ''}
                      onClick={() => setSelectedResult(result)}
                    >
                      <td>
                        <div className="test-name">{result.testName}</div>
                      </td>
                      <td>{result.result}</td>
                      <td>{statusChip(result)}</td>
                      <td>{formatDate(result.testDate)}</td>
                      <td>
                        <button
                          className="btn btn-ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(result);
                          }}
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card detail-card" aria-live="polite">
          <h3>Detailed Report</h3>
          {selectedResult ? (
            <>
              <div className="detail-row">
                <span className="label">Test:</span>
                <span>{selectedResult.testName}</span>
              </div>
              <div className="detail-row">
                <span className="label">Result:</span>
                <span>{selectedResult.result}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span>{statusChip(selectedResult)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Date:</span>
                <span>{formatDate(selectedResult.testDate)}</span>
              </div>
              {selectedResult.notes && (
                <div className="notes">
                  <p className="label">Notes</p>
                  <p>{selectedResult.notes}</p>
                </div>
              )}
              <div className="detail-actions">
                <button className="btn btn-primary" onClick={() => handleDownload(selectedResult)}>
                  Download
                </button>
              </div>
            </>
          ) : (
            <p className="muted">Select a test result to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TestResults;
