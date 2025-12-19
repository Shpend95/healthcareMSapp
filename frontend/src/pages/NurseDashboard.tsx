import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Patient {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  bloodGroup: string;
  emergencyContact: string;
}

interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  notes: string;
}

const NurseDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('patients');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [patientsRes, apptsRes] = await Promise.all([
        api.get('/patients'),
        api.get('/appointments'),
      ]);

      setPatients(patientsRes.data || []);
      setAppointments(apptsRes.data || []);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Nurse Dashboard</h1>

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['patients', 'appointments'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'patients' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">All Patients ({patients.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patients.map((patient) => (
                  <div key={patient.id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <h3 className="font-semibold text-lg">{patient.name}</h3>
                    <p className="text-sm text-gray-600 mt-2">Email: {patient.email}</p>
                    <p className="text-sm text-gray-600">Phone: {patient.phone || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Blood Group: {patient.bloodGroup || 'N/A'}</p>
                    <p className="text-sm text-gray-600">DOB: {patient.dateOfBirth || 'N/A'}</p>
                    {patient.emergencyContact && (
                      <p className="text-sm text-gray-600 mt-2">
                        Emergency: {patient.emergencyContact}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">All Appointments ({appointments.length})</h2>
              <div className="space-y-4">
                {appointments.map((apt) => {
                  const patient = patients.find(p => p.id === apt.patientId);
                  return (
                    <div key={apt.id} className="border rounded-lg p-4">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-semibold">Patient: {patient?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-600">Date: {apt.appointmentDate}</p>
                          <p className="text-sm text-gray-600">Time: {apt.appointmentTime}</p>
                          <p className="text-sm text-gray-600">Status: {apt.status}</p>
                          {apt.notes && <p className="text-sm text-gray-600 mt-1">Notes: {apt.notes}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;
