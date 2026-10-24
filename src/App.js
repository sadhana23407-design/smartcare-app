import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Activity, Search, Plus, Trash2, Edit3, 
  Clock, UserPlus 
} from 'lucide-react';

const API_BASE = 'http://localhost:5001';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Application Data States
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form & UI States
  const [patientSearch, setPatientSearch] = useState('');
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [patientForm, setPatientForm] = useState({ name: '', email: '', phone: '', gender: 'Male' });

  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({ 
    patientId: '', 
    doctorName: 'Dr. Saraswati', 
    appointmentDate: '', 
    status: 'Pending' 
  });

  // Fetch initial data from JSON Server
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [resPatients, resAppointments] = await Promise.all([
        fetch(`${API_BASE}/patients`),
        fetch(`${API_BASE}/appointments`)
      ]);

      if (!resPatients.ok || !resAppointments.ok) {
        throw new Error('Failed to connect to JSON Server');
      }

      const patientsData = await resPatients.json();
      const appointmentsData = await resAppointments.json();

      setPatients(patientsData);
      setAppointments(appointmentsData);
      setError(null);
    } catch (err) {
      setError('Cannot connect to JSON Server. Ensure it is running at http://localhost:5000');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- PATIENT CRUD OPERATIONS ---

  // CREATE / UPDATE Patient
  const handleSavePatient = async (e) => {
    e.preventDefault();
    if (!patientForm.name || !patientForm.email) return;

    try {
      if (editingPatient) {
        // PUT / UPDATE request
        const res = await fetch(`${API_BASE}/patients/${editingPatient.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...editingPatient, ...patientForm })
        });
        const updated = await res.json();
        setPatients(patients.map(p => p.id === updated.id ? updated : p));
      } else {
        // POST / CREATE request
        const newPatient = {
          id: `PAT-${Math.floor(100 + Math.random() * 900)}`,
          ...patientForm
        };
        const res = await fetch(`${API_BASE}/patients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPatient)
        });
        const created = await res.json();
        setPatients([...patients, created]);
      }
      closePatientModal();
    } catch (err) {
      alert('Error saving patient record to JSON Server.');
    }
  };

  // DELETE Patient
  const handleDeletePatient = async (id) => {
    if (window.confirm('Delete this patient record?')) {
      try {
        await fetch(`${API_BASE}/patients/${id}`, { method: 'DELETE' });
        setPatients(patients.filter(p => p.id !== id));
      } catch (err) {
        alert('Error deleting patient from JSON Server.');
      }
    }
  };

  const openEditPatient = (patient) => {
    setEditingPatient(patient);
    setPatientForm({ name: patient.name, email: patient.email, phone: patient.phone, gender: patient.gender });
    setPatientModalOpen(true);
  };

  const closePatientModal = () => {
    setPatientModalOpen(false);
    setEditingPatient(null);
    setPatientForm({ name: '', email: '', phone: '', gender: 'Male' });
  };

  // --- APPOINTMENT CRUD OPERATIONS ---

  // CREATE Appointment
  const handleSaveAppointment = async (e) => {
    e.preventDefault();
    if (!appointmentForm.patientId || !appointmentForm.appointmentDate) return;

    try {
      const newApt = {
        id: `APT-${Math.floor(500 + Math.random() * 900)}`,
        ...appointmentForm
      };
      const res = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApt)
      });
      const created = await res.json();
      setAppointments([...appointments, created]);
      setAppointmentModalOpen(false);
      setAppointmentForm({ patientId: '', doctorName: 'Dr. Sarah Smith', appointmentDate: '', status: 'Pending' });
    } catch (err) {
      alert('Error booking appointment.');
    }
  };

  // UPDATE Appointment Status
  const handleStatusChange = async (id, newStatus) => {
    const apt = appointments.find(a => a.id === id);
    if (!apt) return;

    try {
      const res = await fetch(`${API_BASE}/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const updated = await res.json();
      setAppointments(appointments.map(a => a.id === updated.id ? updated : a));
    } catch (err) {
      alert('Error updating status.');
    }
  };

  // DELETE Appointment
  const handleDeleteAppointment = async (id) => {
    try {
      await fetch(`${API_BASE}/appointments/${id}`, { method: 'DELETE' });
      setAppointments(appointments.filter(a => a.id !== id));
    } catch (err) {
      alert('Error canceling appointment.');
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.id.toLowerCase().includes(patientSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Top Navbar */}
      <nav className="bg-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Activity className="h-8 w-8 text-indigo-200" />
            <span className="text-xl font-bold tracking-tight">SmartCare Portal</span>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'dashboard' ? 'bg-indigo-800 text-white' : 'hover:bg-indigo-500'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('patients')}
              className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'patients' ? 'bg-indigo-800 text-white' : 'hover:bg-indigo-500'}`}
            >
              Patients ({patients.length})
            </button>
            <button 
              onClick={() => setActiveTab('appointments')}
              className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'appointments' ? 'bg-indigo-800 text-white' : 'hover:bg-indigo-500'}`}
            >
              Appointments ({appointments.length})
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-rose-100 border border-rose-300 text-rose-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-slate-500 font-medium">
            Loading data from JSON Server...
          </div>
        ) : (
          <>
            {/* DASHBOARD TAB */}
            {activeTab === 'dashboard' && (
              <div>
                <h1 className="text-2xl font-bold mb-6 text-slate-900">Hospital Metrics Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                      <Users className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Total Patients Registered</p>
                      <p className="text-3xl font-extrabold text-slate-900">{patients.length}</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                      <Calendar className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Total Appointments</p>
                      <p className="text-3xl font-extrabold text-slate-900">{appointments.length}</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                      <Clock className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Pending Confirmations</p>
                      <p className="text-3xl font-extrabold text-slate-900">
                        {appointments.filter(a => a.status === 'Pending').length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Overview Table */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h2 className="text-lg font-bold mb-4 text-slate-900">Recent Appointments</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase">
                          <th className="py-3 px-4">Appointment ID</th>
                          <th className="py-3 px-4">Patient Name</th>
                          <th className="py-3 px-4">Doctor</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {appointments.slice(0, 5).map(apt => {
                          const patient = patients.find(p => p.id === apt.patientId);
                          return (
                            <tr key={apt.id} className="hover:bg-slate-50">
                              <td className="py-3 px-4 font-mono font-medium text-indigo-600">{apt.id}</td>
                              <td className="py-3 px-4 font-medium">{patient ? patient.name : 'Unknown Patient'}</td>
                              <td className="py-3 px-4">{apt.doctorName}</td>
                              <td className="py-3 px-4">{apt.appointmentDate}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  apt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                                  apt.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                                }`}>
                                  {apt.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* PATIENTS TAB */}
            {activeTab === 'patients' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h1 className="text-2xl font-bold text-slate-900">Patient Directory</h1>
                  <button 
                    onClick={() => setPatientModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 shadow-sm transition"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Register New Patient</span>
                  </button>
                </div>

                <div className="mb-6 relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Search patient by name or ID..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase">
                      <tr>
                        <th className="py-3.5 px-4">ID</th>
                        <th className="py-3.5 px-4">Full Name</th>
                        <th className="py-3.5 px-4">Email Address</th>
                        <th className="py-3.5 px-4">Phone</th>
                        <th className="py-3.5 px-4">Gender</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredPatients.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-slate-400">No patient records found.</td>
                        </tr>
                      ) : (
                        filteredPatients.map(patient => (
                          <tr key={patient.id} className="hover:bg-slate-50">
                            <td className="py-3.5 px-4 font-mono text-xs font-bold text-indigo-600">{patient.id}</td>
                            <td className="py-3.5 px-4 font-medium text-slate-900">{patient.name}</td>
                            <td className="py-3.5 px-4 text-slate-600">{patient.email}</td>
                            <td className="py-3.5 px-4 text-slate-600">{patient.phone}</td>
                            <td className="py-3.5 px-4 text-slate-600">{patient.gender}</td>
                            <td className="py-3.5 px-4 text-right space-x-2">
                              <button 
                                onClick={() => openEditPatient(patient)}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeletePatient(patient.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 rounded hover:bg-slate-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* APPOINTMENTS TAB */}
            {activeTab === 'appointments' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h1 className="text-2xl font-bold text-slate-900">Appointments Schedule</h1>
                  <button 
                    onClick={() => setAppointmentModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 shadow-sm transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Book Appointment</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {appointments.map(apt => {
                    const patient = patients.find(p => p.id === apt.patientId);
                    return (
                      <div key={apt.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                              {apt.id}
                            </span>
                            <select 
                              value={apt.status}
                              onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                              className={`text-xs font-semibold px-2 py-1 rounded-full border-none focus:ring-1 focus:ring-indigo-500 cursor-pointer ${
                                apt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                                apt.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>

                          <h3 className="font-bold text-slate-900 text-base mb-1">
                            {patient ? patient.name : 'Unknown Patient'}
                          </h3>
                          <p className="text-xs text-slate-400 mb-4">Patient ID: {apt.patientId}</p>

                          <div className="space-y-1.5 text-xs text-slate-600">
                            <p><span className="font-semibold text-slate-700">Doctor:</span> {apt.doctorName}</p>
                            <p><span className="font-semibold text-slate-700">Date:</span> {apt.appointmentDate}</p>
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
                          <button 
                            onClick={() => handleDeleteAppointment(apt.id)}
                            className="text-xs text-rose-600 hover:text-rose-800 flex items-center space-x-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Cancel Booking</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* PATIENT MODAL */}
      {patientModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingPatient ? 'Edit Patient Info' : 'Register New Patient'}
            </h2>
            <form onSubmit={handleSavePatient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={patientForm.name}
                  onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={patientForm.email}
                  onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  required
                  value={patientForm.phone}
                  onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
                <select 
                  value={patientForm.gender}
                  onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={closePatientModal}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm"
                >
                  Save Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPOINTMENT MODAL */}
      {appointmentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Book New Appointment</h2>
            <form onSubmit={handleSaveAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Patient</label>
                <select 
                  required
                  value={appointmentForm.patientId}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, patientId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose a Registered Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Assigned Doctor</label>
                <select 
                  value={appointmentForm.doctorName}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, doctorName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Dr. Saraswati">Dr. Saraswati (General Physician)</option>
                  <option value="Dr. Jashwant">Dr. Jashwant (Cardiology)</option>
                  <option value="Dr. Mira Raj">Dr. Mira Raj (Pediatrics)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Appointment Date</label>
                <input 
                  type="date" 
                  required
                  value={appointmentForm.appointmentDate}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, appointmentDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setAppointmentModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm"
                >
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}