import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navigation from '../components/Navigation';

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

interface TestResult {
  id: number;
  patientId: number;
  testName: string;
  testDate: string;
  result: string;
  notes: string;
}

interface Insurance {
  id: number;
  patientId: number;
  provider: string;
  policyNumber: string;
  coverageType: string;
  expiryDate: string;
}

interface Payment {
  id: number;
  patientId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
}

interface Doctor {
  id: number;
  name: string;
  specialization: string;
}

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [insurance, setInsurance] = useState<Insurance[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Patient>>({});

  useEffect(() => {
    if (user) {
      fetchPatientData();
      fetchDoctors();
    }
  }, [user]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const patientRes = await api.get('/patients/profile');
      setPatient(patientRes.data);
      setEditForm(patientRes.data);

      const patientId = patientRes.data.id;
      const [apptsRes, testsRes, insRes, paysRes] = await Promise.all([
        api.get(`/appointments/patient/${patientId}`),
        api.get(`/test-results/patient/${patientId}`),
        api.get(`/insurance/patient/${patientId}`),
        api.get(`/payments/patient/${patientId}`),
      ]);

      setAppointments(apptsRes.data);
      setTestResults(testsRes.data);
      setInsurance(insRes.data);
      setPayments(paysRes.data);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors');
      setDoctors(res.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!patient) return;
    try {
      await api.put(`/patients/${patient.id}`, editForm);
      setPatient({ ...patient, ...editForm });
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  const handleBookAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!patient) return;
    const formData = new FormData(e.currentTarget);
    try {
      await api.post('/appointments', {
        patientId: patient.id,
        doctorId: parseInt(formData.get('doctorId') as string),
        appointmentDate: formData.get('appointmentDate'),
        appointmentTime: formData.get('appointmentTime'),
        status: 'SCHEDULED',
        notes: formData.get('notes') || '',
      });
      alert('Appointment booked successfully!');
      fetchPatientData();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      alert('Failed to book appointment');
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

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            Patient profile not found. Please contact administrator.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Patient Dashboard</h1>

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {['profile', 'appointments', 'test-results', 'insurance', 'payments'].map((tab) => (
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
            {activeTab === 'profile' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">Profile</h2>
                  <button
                    onClick={() => editing ? handleUpdateProfile() : setEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    {editing ? 'Save' : 'Edit'}
                  </button>
                </div>
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="text"
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <input
                        type="text"
                        value={editForm.address || ''}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                      <input
                        type="text"
                        value={editForm.bloodGroup || ''}
                        onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                      <input
                        type="text"
                        value={editForm.emergencyContact || ''}
                        onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{patient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{patient.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{patient.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">{patient.address || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-medium">{patient.dateOfBirth || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Blood Group</p>
                      <p className="font-medium">{patient.bloodGroup || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Emergency Contact</p>
                      <p className="font-medium">{patient.emergencyContact || 'N/A'}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'appointments' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Appointments</h2>
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Book New Appointment</h3>
                  <form onSubmit={handleBookAppointment} className="space-y-4 bg-gray-50 p-4 rounded">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Doctor</label>
                        <select name="doctorId" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                          <option value="">Select Doctor</option>
                          {doctors.map((doc) => (
                            <option key={doc.id} value={doc.id}>
                              {doc.name} - {doc.specialization}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input type="date" name="appointmentDate" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Time</label>
                        <input type="time" name="appointmentTime" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                        <input type="text" name="notes" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                      </div>
                    </div>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                      Book Appointment
                    </button>
                  </form>
                </div>
                <div className="space-y-4">
                  {appointments.length === 0 ? (
                    <p className="text-gray-500">No appointments found</p>
                  ) : (
                    appointments.map((apt) => {
                      const doctor = doctors.find((d) => d.id === apt.doctorId);
                      return (
                        <div key={apt.id} className="border border-gray-200 rounded p-4">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">{doctor?.name || 'Unknown Doctor'}</p>
                              <p className="text-sm text-gray-600">{doctor?.specialization || ''}</p>
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

            {activeTab === 'test-results' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Test Results</h2>
                <div className="space-y-4">
                  {testResults.length === 0 ? (
                    <p className="text-gray-500">No test results found</p>
                  ) : (
                    testResults.map((test) => (
                      <div key={test.id} className="border border-gray-200 rounded p-4">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{test.testName}</p>
                            <p className="text-sm text-gray-600">{new Date(test.testDate).toLocaleDateString()}</p>
                            <p className="text-sm mt-2">Result: <span className="font-medium">{test.result}</span></p>
                            {test.notes && <p className="text-sm text-gray-600 mt-2">Notes: {test.notes}</p>}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'insurance' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Insurance</h2>
                <div className="space-y-4">
                  {insurance.length === 0 ? (
                    <p className="text-gray-500">No insurance records found</p>
                  ) : (
                    insurance.map((ins) => (
                      <div key={ins.id} className="border border-gray-200 rounded p-4">
                        <p className="font-medium">{ins.provider}</p>
                        <p className="text-sm text-gray-600">Policy: {ins.policyNumber}</p>
                        <p className="text-sm">Coverage: {ins.coverageType}</p>
                        <p className="text-sm">Expires: {new Date(ins.expiryDate).toLocaleDateString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Payments</h2>
                <div className="space-y-4">
                  {payments.length === 0 ? (
                    <p className="text-gray-500">No payment records found</p>
                  ) : (
                    payments.map((pay) => (
                      <div key={pay.id} className="border border-gray-200 rounded p-4">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">${pay.amount.toFixed(2)}</p>
                            <p className="text-sm text-gray-600">{new Date(pay.paymentDate).toLocaleDateString()}</p>
                            <p className="text-sm">Method: {pay.paymentMethod}</p>
                          </div>
                          <div>
                            <span className={`px-3 py-1 rounded text-sm font-medium ${
                              pay.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {pay.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;