import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navigation from '../components/Navigation';

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
  name: string;
  email: string;
  phone: string;
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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activeTab, setActiveTab] = useState('appointments');
  const [loading, setLoading] = useState(true);
  const [testForm, setTestForm] = useState({
    patientId: '',
    testName: '',
    testDate: new Date().toISOString().split('T')[0],
    result: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [apptsRes, patientsRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/patients'),
      ]);

      const allAppointments = apptsRes.data;
      // Show all appointments - in a real system, you'd filter by doctor's ID
      setAppointments(allAppointments);
      setPatients(patientsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTestResult = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/test-results', {
        ...testForm,
        patientId: parseInt(testForm.patientId),
      });
      alert('Test result added successfully!');
      setTestForm({
        patientId: '',
        testName: '',
        testDate: new Date().toISOString().split('T')[0],
        result: '',
        notes: '',
      });
    } catch (error) {
      alert('Failed to add test result');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Doctor Dashboard</h1>

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {['appointments', 'patients', 'add-test'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'appointments' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Appointments</h2>
                <div className="space-y-4">
                  {appointments.length === 0 ? (
                    <p className="text-gray-500">No appointments found</p>
                  ) : (
                    appointments.map((apt) => {
                      const patient = patients.find((p) => p.id === apt.patientId);
                      return (
                        <div key={apt.id} className="border border-gray-200 rounded p-4">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">{patient?.name || 'Unknown Patient'}</p>
                              <p className="text-sm text-gray-600">{patient?.email || ''}</p>
                              <p className="text-sm">{new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime}</p>
                              <p className="text-sm">Status: <span className={`font-medium ${apt.status === 'COMPLETED' ? 'text-green-600' : 'text-blue-600'}`}>{apt.status}</span></p>
                            </div>
                          </div>
                          {apt.notes && <p className="text-sm text-gray-600 mt-2">Notes: {apt.notes}</p>}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {activeTab === 'patients' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Patients</h2>
                <div className="space-y-4">
                  {patients.length === 0 ? (
                    <p className="text-gray-500">No patients found</p>
                  ) : (
                    patients.map((patient) => (
                      <div key={patient.id} className="border border-gray-200 rounded p-4">
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-gray-600">{patient.email}</p>
                        <p className="text-sm">{patient.phone || 'N/A'}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'add-test' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Add Test Result</h2>
                <form onSubmit={handleAddTestResult} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Patient</label>
                    <select
                      value={testForm.patientId}
                      onChange={(e) => setTestForm({ ...testForm, patientId: e.target.value })}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Patient</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Test Name</label>
                    <input
                      type="text"
                      value={testForm.testName}
                      onChange={(e) => setTestForm({ ...testForm, testName: e.target.value })}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Test Date</label>
                    <input
                      type="date"
                      value={testForm.testDate}
                      onChange={(e) => setTestForm({ ...testForm, testDate: e.target.value })}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Result</label>
                    <input
                      type="text"
                      value={testForm.result}
                      onChange={(e) => setTestForm({ ...testForm, result: e.target.value })}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      value={testForm.notes}
                      onChange={(e) => setTestForm({ ...testForm, notes: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                    />
                  </div>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                    Add Test Result
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
