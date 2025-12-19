import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navigation from '../components/Navigation';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  name: string;
}

interface Stats {
  users: number;
  patients: number;
  doctors: number;
  nurses: number;
  appointments: number;
  testResults: number;
  payments: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({
    users: 0,
    patients: 0,
    doctors: 0,
    nurses: 0,
    appointments: 0,
    testResults: 0,
    payments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, patientsRes, doctorsRes, nursesRes, appointmentsRes, testsRes, paymentsRes] = await Promise.all([
        api.get('/patients').catch(() => ({ data: [] })), // Using patients endpoint as proxy
        api.get('/patients'),
        api.get('/doctors'),
        api.get('/nurses'),
        api.get('/appointments'),
        api.get('/test-results'),
        api.get('/payments'),
      ]);

      // For users, we'll need to create a separate endpoint or use a workaround
      // For now, we'll show stats
      setStats({
        users: 0, // Would need a users endpoint
        patients: patientsRes.data.length,
        doctors: doctorsRes.data.length,
        nurses: nursesRes.data.length,
        appointments: appointmentsRes.data.length,
        testResults: testsRes.data.length,
        payments: paymentsRes.data.length,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {['overview', 'data'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">System Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded p-4">
                    <p className="text-sm text-blue-600 font-medium">Patients</p>
                    <p className="text-3xl font-bold text-blue-800">{stats.patients}</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded p-4">
                    <p className="text-sm text-green-600 font-medium">Doctors</p>
                    <p className="text-3xl font-bold text-green-800">{stats.doctors}</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded p-4">
                    <p className="text-sm text-purple-600 font-medium">Nurses</p>
                    <p className="text-3xl font-bold text-purple-800">{stats.nurses}</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                    <p className="text-sm text-yellow-600 font-medium">Appointments</p>
                    <p className="text-3xl font-bold text-yellow-800">{stats.appointments}</p>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 rounded p-4">
                    <p className="text-sm text-indigo-600 font-medium">Test Results</p>
                    <p className="text-3xl font-bold text-indigo-800">{stats.testResults}</p>
                  </div>
                  <div className="bg-pink-50 border border-pink-200 rounded p-4">
                    <p className="text-sm text-pink-600 font-medium">Payments</p>
                    <p className="text-3xl font-bold text-pink-800">{stats.payments}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">System Data</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">All System Data</h3>
                    <p className="text-gray-600">
                      Use the API endpoints to view and manage all system data:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                      <li>Patients: /api/patients</li>
                      <li>Doctors: /api/doctors</li>
                      <li>Nurses: /api/nurses</li>
                      <li>Appointments: /api/appointments</li>
                      <li>Test Results: /api/test-results</li>
                      <li>Insurance: /api/insurance</li>
                      <li>Payments: /api/payments</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
