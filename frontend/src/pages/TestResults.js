import React, { useEffect, useMemo, useState } from 'react';

const mockResults = [
  {
    id: 1,
    name: 'Hemoglobin',
    value: '14.2 g/dL',
    valueNumber: 14.2,
    normalRange: '13.5 - 17.5 g/dL',
    status: 'Normal',
    type: 'Blood',
    date: '2025-12-01',
    notes: 'Values remain stable; continue current diet and hydration.',
  },
  {
    id: 2,
    name: 'Hemoglobin',
    value: '13.8 g/dL',
    valueNumber: 13.8,
    normalRange: '13.5 - 17.5 g/dL',
    status: 'Normal',
    type: 'Blood',
    date: '2025-09-03',
    notes: 'Slight uptick compared to June draw, no action needed.',
  },
  {
    id: 3,
    name: 'WBC Count',
    value: '8500 /uL',
    valueNumber: 8500,
    normalRange: '4500 - 11000 /uL',
    status: 'Normal',
    type: 'Blood',
    date: '2025-11-12',
    notes: 'Within expected range; no signs of infection.',
  },
  {
    id: 4,
    name: 'Glucose (Fasting)',
    value: '105 mg/dL',
    valueNumber: 105,
    normalRange: '70 - 100 mg/dL',
    status: 'High',
    type: 'Blood',
    date: '2025-12-02',
    notes: 'Slightly elevated; recheck in 1 month and continue diet control.',
  },
  {
    id: 5,
    name: 'Glucose (Fasting)',
    value: '98 mg/dL',
    valueNumber: 98,
    normalRange: '70 - 100 mg/dL',
    status: 'Normal',
    type: 'Blood',
    date: '2025-09-10',
    notes: 'Back to goal after dietary changes.',
  },
  {
    id: 6,
    name: 'Cholesterol',
    value: '190 mg/dL',
    valueNumber: 190,
    normalRange: '< 200 mg/dL',
    status: 'Normal',
    type: 'Blood',
    date: '2025-10-22',
    notes: 'Good control; maintain exercise plan.',
  },
  {
    id: 7,
    name: 'Triglycerides',
    value: '210 mg/dL',
    valueNumber: 210,
    normalRange: '< 150 mg/dL',
    status: 'High',
    type: 'Blood',
    date: '2025-08-30',
    notes: 'Elevated; recommend low-carb diet and repeat in 6 weeks.',
  },
  {
    id: 8,
    name: 'Urinalysis (Protein)',
    value: '12 mg/dL',
    valueNumber: 12,
    normalRange: '0 - 15 mg/dL',
    status: 'Borderline',
    type: 'Urine',
    date: '2025-09-14',
    notes: 'Trace protein; encourage hydration and monitor.',
  },
  {
    id: 9,
    name: 'Urine Culture',
    value: 'Negative growth',
    normalRange: 'No growth',
    status: 'Normal',
    type: 'Urine',
    date: '2025-07-18',
    notes: 'No infection detected.',
  },
  {
    id: 10,
    name: 'Chest X-Ray',
    value: 'Clear lung fields',
    normalRange: 'No acute findings',
    status: 'Normal',
    type: 'X-Ray',
    date: '2025-07-25',
    notes: 'No acute cardiopulmonary process.',
  },
];

const statusClassMap = {
  Normal: 'status-normal',
  Borderline: 'status-borderline',
  High: 'status-high',
  Low: 'status-low',
};

const sorters = {
  'date-desc': (a, b) => new Date(b.date) - new Date(a.date),
  'date-asc': (a, b) => new Date(a.date) - new Date(b.date),
  name: (a, b) => a.name.localeCompare(b.name),
  status: (a, b) => a.status.localeCompare(b.status),
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const Sparkline = ({ data }) => {
  if (!data?.length) return null;
  const width = 180;
  const height = 70;
  const padding = 12;
  const values = data.map((item) => item.valueNumber);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((val, idx) => {
      const x = padding + (idx / Math.max(values.length - 1, 1)) * (width - padding * 2);
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Trend chart">
      <polyline fill="none" stroke="#0066cc" strokeWidth="2" points={points} />
      {values.map((val, idx) => {
        const x = padding + (idx / Math.max(values.length - 1, 1)) * (width - padding * 2);
        const y = height - padding - ((val - min) / range) * (height - padding * 2);
        return <circle key={val + idx} cx={x} cy={y} r="3" fill="#0f9d58" />;
      })}
    </svg>
  );
};

function TestResults() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [selectedResult, setSelectedResult] = useState(mockResults[0]);

  const filteredResults = useMemo(() => {
    return mockResults
      .filter((result) => result.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((result) => (typeFilter === 'all' ? true : result.type === typeFilter))
      .filter((result) => (startDate ? new Date(result.date) >= new Date(startDate) : true))
      .filter((result) => (endDate ? new Date(result.date) <= new Date(endDate) : true))
      .sort(sorters[sortBy]);
  }, [searchTerm, typeFilter, startDate, endDate, sortBy]);

  useEffect(() => {
    if (!filteredResults.length) {
      setSelectedResult(null);
      return;
    }

    if (!selectedResult || !filteredResults.some((item) => item.id === selectedResult.id)) {
      setSelectedResult(filteredResults[0]);
    }
  }, [filteredResults, selectedResult]);

  const trendSeries = useMemo(() => {
    const grouped = mockResults.reduce((acc, result) => {
      if (typeof result.valueNumber !== 'number') return acc;
      acc[result.name] = acc[result.name] ? [...acc[result.name], result] : [result];
      return acc;
    }, {});

    return Object.entries(grouped)
      .filter(([, series]) => series.length > 1)
      .map(([name, series]) => ({
        name,
        points: [...series].sort((a, b) => new Date(a.date) - new Date(b.date)),
      }));
  }, []);

  const handleDownload = (result) => {
    const printable = [
      `Test Result: ${result.name}`,
      `Value: ${result.value}`,
      `Normal Range: ${result.normalRange || 'See report'}`,
      `Status: ${result.status}`,
      `Date: ${formatDate(result.date)}`,
      `Type: ${result.type}`,
      `Doctor Notes: ${result.notes}`,
    ].join('\n');

    const blob = new Blob([printable], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${result.name.replace(/\s+/g, '-').toLowerCase()}-${result.date}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const statusChip = (status) => (
    <span className={`status-chip ${statusClassMap[status] || ''}`}>{status}</span>
  );

  return (
    <div data-testid="test-results-page">
      <div className="page-header">
        <h1>Test Results</h1>
        <p>Your latest laboratory results, filters, and trends at a glance.</p>
      </div>

      <div className="card filters-card">
        <div className="filters-row">
          <div className="field">
            <label htmlFor="search">Search by test</label>
            <input
              id="search"
              type="text"
              placeholder="e.g. Hemoglobin"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="type">Test type</label>
            <select id="type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="Blood">Blood</option>
              <option value="Urine">Urine</option>
              <option value="X-Ray">X-Ray</option>
            </select>
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
              <option value="status">Status</option>
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
                  <th>Value</th>
                  <th>Normal Range</th>
              <th>Status</th>
              <th>Date</th>
                  <th>Actions</th>
            </tr>
          </thead>
          <tbody>
                {filteredResults.map((result) => (
                  <tr
                    key={result.id}
                    className={`${statusClassMap[result.status] || ''} ${
                      selectedResult?.id === result.id ? 'row-selected' : ''
                    }`}
                    onClick={() => setSelectedResult(result)}
                  >
                    <td>
                      <div className="test-name">{result.name}</div>
                      <div className="muted small-text">{result.type}</div>
                    </td>
                    <td>{result.value}</td>
                    <td>{result.normalRange || 'See detail'}</td>
                    <td>{statusChip(result.status)}</td>
                    <td>{formatDate(result.date)}</td>
                    <td>
                      <button className="btn btn-ghost" onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(result);
                      }}>
                        Download PDF
                      </button>
                </td>
              </tr>
            ))}
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
                <span>{selectedResult.name}</span>
              </div>
              <div className="detail-row">
                <span className="label">Value:</span>
                <span>{selectedResult.value}</span>
              </div>
              <div className="detail-row">
                <span className="label">Normal Range:</span>
                <span>{selectedResult.normalRange || 'See report'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span>{statusChip(selectedResult.status)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Test Type:</span>
                <span>{selectedResult.type}</span>
              </div>
              <div className="detail-row">
                <span className="label">Date:</span>
                <span>{formatDate(selectedResult.date)}</span>
              </div>
              <div className="notes">
                <p className="label">Doctor notes</p>
                <p>{selectedResult.notes}</p>
              </div>
              <div className="detail-actions">
                <button className="btn btn-primary" onClick={() => handleDownload(selectedResult)}>
                  Download PDF
                </button>
                <button className="btn btn-secondary" onClick={() => window.alert('Share link copied')}>
                  Share
                </button>
              </div>
            </>
          ) : (
            <p className="muted">No results match the filters.</p>
          )}
        </div>
      </div>

      <div className="card trend-card">
        <div className="trend-header">
          <h3>Trends over time</h3>
          <p className="muted small-text">Repeated tests plotted from the past 6 months</p>
        </div>
        <div className="trend-grid">
          {trendSeries.map((series) => (
            <div key={series.name} className="trend-item">
              <div className="trend-title">
                <strong>{series.name}</strong>
                <span className="muted small-text">
                  Last: {series.points[series.points.length - 1].value} ({series.points[series.points.length - 1].status})
                </span>
              </div>
              <Sparkline data={series.points} />
              <div className="trend-labels">
                {series.points.map((point) => (
                  <span key={point.id} className="muted tiny-text">
                    {new Date(point.date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {!trendSeries.length && <p className="muted">No repeated tests to chart yet.</p>}
        </div>
      </div>
    </div>
  );
}

export default TestResults;

