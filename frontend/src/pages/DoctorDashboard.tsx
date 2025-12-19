import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  notes: string;
}

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

interface TestResult {
  id: number;
  patientId: number;
  testName: string;
  testDate: string;
  result: string;
  notes: string;
}

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [newTestResult, setNewTestResult] = useState({
    testName: '',
    testDate: '',
    result: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // For demo, assume doctorId = 1 (in real app, get from user profile)
      const doctorId = 1;
      
      const [apptsRes, patientsRes] = await Promise.all([
        api.get(`/appointments/doctor/${doctorId}`),
        api.get('/patients'),
      ]);

      setAppointments(apptsRes.data || []);
      setPatients(patientsRes.data || []);
    } catch (err: any) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTestResult = async () => {
    if (!selectedPatientId) {
      setError('Please select a patient');
      return;
    }
    try {
      await api.post('/test-results', {
        patientId: selectedPatientId,
        testName: newTestResult.testName,
        testDate: newTestResult.testDate,
        result: newTestResult.result,
        notes: newTestResult.notes,
      });
      setNewTestResult({ testName: '', testDate: '', result: '', notes: '' });
      setSelectedPatientId(null);
      setError('');
      alert('Test result added successfully');
    } catch (err: any) {
      setError('Failed to add test result');
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Doctor Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['appointments', 'patients', 'add-test-result'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'appointments' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">My Appointments</h2>
              <div className="space-y-4">
                {appointments.length === 0 ? (
                  <p className="text-gray-500">No appointments found</p>
                ) : (
                  appointments.map((apt) => {
                    const patient = patients.find(p => p.id === apt.patientId);
                    return (
                      <div key={apt.id} className="border rounded-lg p-4">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-semibold">Patient: {patient?.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-600">Date: {apt.appointmentDate}</p>
                            <p className="text-sm text-gray-600">Time: {apt.appointmentTime}</p>
                            <p className="text-sm text-gray-600">Status: {apt.status}</p>
                            {apt.notes && <p className="text-sm text-gray-600">Notes: {apt.notes}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'patients' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">All Patients</h2>
              <div className="space-y-4">
                {patients.length === 0 ? (
                  <p className="text-gray-500">No patients found</p>
                ) : (
                  patients.map((patient) => (
                    <div key={patient.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold">{patient.name}</h3>
                      <p className="text-sm text-gray-600">Email: {patient.email}</p>
                      <p className="text-sm text-gray-600">Phone: {patient.phone}</p>
                      <p className="text-sm text-gray-600">Blood Group: {patient.bloodGroup}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'add-test-result' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Add Test Result</h2>
              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Patient</label>
                  <select
                    value={selectedPatientId || ''}
                    onChange={(e) => setSelectedPatientId(parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="">Select Patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Test Name</label>
                  <input
                    type="text"
                    value={newTestResult.testName}
                    onChange={(e) => setNewTestResult({ ...newTestResult, testName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Test Date</label>
                  <input
                    type="date"
                    value={newTestResult.testDate}
                    onChange={(e) => setNewTestResult({ ...newTestResult, testDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Result</label>
                  <textarea
                    value={newTestResult.result}
                    onChange={(e) => setNewTestResult({ ...newTestResult, result: e.target.value })}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={newTestResult.notes}
                    onChange={(e) => setNewTestResult({ ...newTestResult, notes: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                <button
                  onClick={handleAddTestResult}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Add Test Result
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
