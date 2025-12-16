import React, { useState, useEffect } from 'react';
import { doctorService } from '../services/api';

function DoctorListing() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorService.getAll();
      setDoctors(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load doctors. Please try again.');
      console.error('Error loading doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUniqueSpecializations = () => {
    const specializations = doctors.map(doctor => doctor.specialization);
    return [...new Set(specializations)];
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = !specializationFilter || doctor.specialization === specializationFilter;
    return matchesSearch && matchesSpecialization;
  });

  if (loading) {
    return (
      <div data-testid="doctors-page">
        <div className="loading" data-testid="doctors-loading">Loading doctors...</div>
      </div>
    );
  }

  return (
    <div data-testid="doctors-page">
      <div className="page-header">
        <h1 data-testid="doctors-title">Our Doctors</h1>
        <p data-testid="doctors-subtitle">Meet our experienced team of medical professionals</p>
      </div>

      {error && (
        <div className="error" data-testid="doctors-error">
          {error}
        </div>
      )}

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by name or specialization..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="doctor-search-input"
          id="doctor-search-input"
          style={{ flex: 1, minWidth: '200px', padding: '0.75rem' }}
        />
        <select
          value={specializationFilter}
          onChange={(e) => setSpecializationFilter(e.target.value)}
          data-testid="specialization-filter"
          id="specialization-filter"
          style={{ padding: '0.75rem', minWidth: '200px' }}
        >
          <option value="">All Specializations</option>
          {getUniqueSpecializations().map(spec => (
            <option key={spec} value={spec} data-testid={`specialization-option-${spec}`}>
              {spec}
            </option>
          ))}
        </select>
      </div>

      {filteredDoctors.length === 0 ? (
        <div data-testid="no-doctors-message" style={{ textAlign: 'center', padding: '2rem' }}>
          No doctors found matching your criteria.
        </div>
      ) : (
        <div className="doctors-grid" data-testid="doctors-grid">
          {filteredDoctors.map(doctor => (
            <div key={doctor.id} className="card" data-testid={`doctor-card-${doctor.id}`}>
              <h3 data-testid={`doctor-name-${doctor.id}`}>{doctor.name}</h3>
              <p data-testid={`doctor-specialization-${doctor.id}`}>
                <strong>Specialization:</strong> {doctor.specialization}
              </p>
              <p data-testid={`doctor-email-${doctor.id}`}>
                <strong>Email:</strong> {doctor.email}
              </p>
              <p data-testid={`doctor-phone-${doctor.id}`}>
                <strong>Phone:</strong> {doctor.phone}
              </p>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <p data-testid="doctors-count">
          Showing {filteredDoctors.length} of {doctors.length} doctors
        </p>
      </div>
    </div>
  );
}

export default DoctorListing;
