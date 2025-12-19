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
  email: string;
  phone: string;
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
  const [error, setError] = useState('');

  const [editProfile, setEditProfile] = useState(false);
  const [profileData, setProfileData] = useState<Partial<Patient>>({});

  const [newAppointment, setNewAppointment] = useState({
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: '',
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Fetch patient by userId
      const patientRes = await api.get(`/patients/user/${user.id}`);
      const patientData = patientRes.data;
      setPatient(patientData);
      setProfileData(patientData);

      // Fetch related data
      const [apptsRes, testRes, insRes, payRes, docsRes] = await Promise.all([
        api.get(`/appointments/patient/${patientData.id}`),
        api.get(`/test-results/patient/${patientData.id}`),
        api.get(`/insurance/patient/${patientData.id}`),
        api.get(`/payments/patient/${patientData.id}`),
        api.get('/doctors'),
      ]);

      setAppointments(apptsRes.data || []);
      setTestResults(testRes.data || []);
      setInsurance(insRes.data || []);
      setPayments(payRes.data || []);
      setDoctors(docsRes.data || []);
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Patient doesn't exist yet, create one
        try {
          const newPatient = {
            userId: user.id,
            name: user.name,
            email: user.email,
            phone: '',
            address: '',
            dateOfBirth: '',
            bloodGroup: '',
            emergencyContact: '',
          };
          const createRes = await api.post('/patients', newPatient);
          setPatient(createRes.data);
          setProfileData(createRes.data);
        } catch (createErr) {
          setError('Failed to create patient profile');
        }
      } else {
        setError('Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!patient) return;
    try {
      const res = await api.put(`/patients/${patient.id}`, profileData);
      setPatient(res.data);
      setEditProfile(false);
      setError('');
    } catch (err: any) {
      setError('Failed to update profile');
    }
  };

  const handleBookAppointment = async () => {
    if (!patient) return;
    try {
      await api.post('/appointments', {
        patientId: patient.id,
        doctorId: parseInt(newAppointment.doctorId),
        appointmentDate: newAppointment.appointmentDate,
        appointmentTime: newAppointment.appointmentTime,
        status: 'SCHEDULED',
        notes: newAppointment.notes,
      });
      setNewAppointment({ doctorId: '', appointmentDate: '', appointmentTime: '', notes: '' });
      fetchData();
      setError('');
    } catch (err: any) {
      setError('Failed to book appointment');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Failed to load patient data</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Patient Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['profile', 'appointments', 'test-results', 'insurance', 'payments'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                <h2 className="text-2xl font-semibold">My Profile</h2>
                <button
                  onClick={() => editProfile ? handleUpdateProfile() : setEditProfile(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  {editProfile ? 'Save' : 'Edit'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={profileData.name || ''}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    disabled={!editProfile}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={profileData.email || ''}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={!editProfile}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="text"
                    value={profileData.phone || ''}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    disabled={!editProfile}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    value={profileData.dateOfBirth || ''}
                    onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                    disabled={!editProfile}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                  <input
                    type="text"
                    value={profileData.bloodGroup || ''}
                    onChange={(e) => setProfileData({ ...profileData, bloodGroup: e.target.value })}
                    disabled={!editProfile}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    value={profileData.address || ''}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    disabled={!editProfile}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                  <input
                    type="text"
                    value={profileData.emergencyContact || ''}
                    onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                    disabled={!editProfile}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">My Appointments</h2>
              
              <div className="mb-6 bg-gray-50 p-4 rounded">
                <h3 className="font-semibold mb-3">Book New Appointment</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Doctor</label>
                    <select
                      value={newAppointment.doctorId}
                      onChange={(e) => setNewAppointment({ ...newAppointment, doctorId: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    >
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
                    <input
                      type="date"
                      value={newAppointment.appointmentDate}
                      onChange={(e) => setNewAppointment({ ...newAppointment, appointmentDate: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <input
                      type="time"
                      value={newAppointment.appointmentTime}
                      onChange={(e) => setNewAppointment({ ...newAppointment, appointmentTime: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <input
                      type="text"
                      value={newAppointment.notes}
                      onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={handleBookAppointment}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Book Appointment
                </button>
              </div>

              <div className="space-y-4">
                {appointments.length === 0 ? (
                  <p className="text-gray-500">No appointments found</p>
                ) : (
                  appointments.map((apt) => (
                    <div key={apt.id} className="border rounded-lg p-4">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-semibold">Date: {apt.appointmentDate}</p>
                          <p className="text-sm text-gray-600">Time: {apt.appointmentTime}</p>
                          <p className="text-sm text-gray-600">Status: {apt.status}</p>
                          {apt.notes && <p className="text-sm text-gray-600">Notes: {apt.notes}</p>}
                        </div>
                      </div>
                    </div>
                  ))
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
                    <div key={test.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold">{test.testName}</h3>
                      <p className="text-sm text-gray-600">Date: {test.testDate}</p>
                      <p className="mt-2">{test.result}</p>
                      {test.notes && <p className="text-sm text-gray-500 mt-1">Notes: {test.notes}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'insurance' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Insurance Information</h2>
              <div className="space-y-4">
                {insurance.length === 0 ? (
                  <p className="text-gray-500">No insurance information found</p>
                ) : (
                  insurance.map((ins) => (
                    <div key={ins.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold">{ins.provider}</h3>
                      <p className="text-sm text-gray-600">Policy Number: {ins.policyNumber}</p>
                      <p className="text-sm text-gray-600">Coverage: {ins.coverageType}</p>
                      <p className="text-sm text-gray-600">Expiry: {ins.expiryDate}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Payment History</h2>
              <div className="space-y-4">
                {payments.length === 0 ? (
                  <p className="text-gray-500">No payment records found</p>
                ) : (
                  payments.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-semibold">${payment.amount.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">Date: {payment.paymentDate}</p>
                          <p className="text-sm text-gray-600">Method: {payment.paymentMethod}</p>
                        </div>
                        <span className={`px-3 py-1 rounded ${
                          payment.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status}
                        </span>
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
  );
};

export default PatientDashboard;
