import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import PatientRegistration from './pages/PatientRegistration';
import AppointmentBooking from './pages/AppointmentBooking';
import DoctorListing from './pages/DoctorListing';
import PatientDashboard from './pages/PatientDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Dashboard from './pages/Dashboard';
import TestResults from './pages/TestResults';
import Insurance from './pages/Insurance';
import Payment from './pages/Payment';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import NurseDashboard from './pages/NurseDashboard';
import ForbiddenPage from './pages/ForbiddenPage';
import PatientProfile from './pages/PatientProfile';
import AppointmentScheduling from './pages/AppointmentScheduling';
import HealthRecordsDashboard from './pages/HealthRecordsDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navigation />
            <main className="main-content">
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/patient-registration" element={<PatientRegistration />} />
                  <Route path="/appointments" element={<AppointmentBooking />} />
                  <Route path="/doctors" element={<DoctorListing />} />
                  <Route path="/forbidden" element={<ForbiddenPage />} />

                  {/* Patient portal */}
                  <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard/:patientId" element={<PatientDashboard />} />
                    <Route path="/test-results" element={<TestResults />} />
                    <Route path="/insurance" element={<Insurance />} />
                    <Route path="/payment" element={<Payment />} />
                    <Route path="/profile" element={<PatientProfile />} />
                    <Route path="/appointments/schedule" element={<AppointmentScheduling />} />
                    <Route path="/health-records" element={<HealthRecordsDashboard />} />
                  </Route>

                  {/* Admin, Doctor, Nurse dashboards */}
                  <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                  </Route>
                  <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
                    <Route path="/doctor" element={<DoctorDashboard />} />
                  </Route>
                  <Route element={<ProtectedRoute allowedRoles={['NURSE']} />}>
                    <Route path="/nurse" element={<NurseDashboard />} />
                  </Route>
                </Routes>
              </ErrorBoundary>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
