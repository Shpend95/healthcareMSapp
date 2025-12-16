import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div data-testid="home-page">
      <div className="hero-section">
        <h1 data-testid="home-title">Welcome to Mount Hospital</h1>
        <p data-testid="home-subtitle">
          Your trusted healthcare partner providing compassionate and quality medical care
        </p>
        <Link 
          to="/patient-registration" 
          className="btn btn-primary"
          data-testid="home-register-btn"
          id="home-register-btn"
        >
          Register Now
        </Link>
      </div>

      <div className="page-header">
        <h2 data-testid="home-about-title">About Mount Hospital</h2>
      </div>

      <p data-testid="home-description" style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
        Mount Hospital is a leading healthcare institution committed to providing 
        excellent medical services. We offer a wide range of specialties and 
        ensure the highest standards of patient care.
      </p>

      <div className="features">
        <div className="feature-card">
          <h3 data-testid="feature-1-title">Expert Doctors</h3>
          <p data-testid="feature-1-description">
            Our team of experienced and qualified doctors are here to provide you with the best care.
          </p>
        </div>
        <div className="feature-card">
          <h3 data-testid="feature-2-title">Easy Appointments</h3>
          <p data-testid="feature-2-description">
            Book your appointments online quickly and easily through our user-friendly system.
          </p>
        </div>
        <div className="feature-card">
          <h3 data-testid="feature-3-title">Patient Care</h3>
          <p data-testid="feature-3-description">
            We prioritize your health and wellbeing with personalized treatment plans.
          </p>
        </div>
      </div>

      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <Link 
          to="/appointments" 
          className="btn btn-primary"
          data-testid="home-book-appointment-btn"
          id="home-book-appointment-btn"
        >
          Book an Appointment
        </Link>
        <Link 
          to="/doctors" 
          className="btn btn-secondary"
          style={{ marginLeft: '1rem' }}
          data-testid="home-view-doctors-btn"
          id="home-view-doctors-btn"
        >
          View Doctors
        </Link>
      </div>
    </div>
  );
}

export default HomePage;
