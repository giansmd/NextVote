import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Vote, Users, ShieldAlert, FileText, Plus, Play, Square, XCircle, 
  UserPlus, Upload, RefreshCw, CheckCircle, Search 
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('elections');
  const [elections, setElections] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Election Form Modal
  const [showElectionModal, setShowElectionModal] = useState(false);
  const [electionForm, setElectionForm] = useState({
    name: '',
    description: '',
    academicPeriod: '2026-I',
    category: 'Rectorado',
    faculty: 'General',
    school: 'General',
    startDate: '2026-07-21',
    startTime: '08:00',
    endDate: '2026-07-22',
    endTime: '18:00'
  });

  // Candidate Form Modal
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [candidateForm, setCandidateForm] = useState({
    fullName: '',
    listNumber: '',
    politicalMovement: '',
    position: 'Rector',
    workPlan: '',
    photoUrl: ''
  });

  // Load initial data
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'elections') {
        const res = await api.get('/elections');
        setElections(res.data);
      } else if (activeTab === 'users') {
        const res = await api.get('/users');
        setUsers(res.data.users || res.data);
      } else if (activeTab === 'audit') {
        const res = await api.get('/audit');
        setLogs(res.data.logs || []);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateElection = async (e) => {
    e.preventDefault();
    try {
      await api.post('/elections', electionForm);
      setShowElectionModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al crear la elección');
    }
  };

  const handleCreateCandidate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/candidates', {
        ...candidateForm,
        electionId: selectedElectionId
      });
      setShowCandidateModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al agregar candidato');
    }
  };

  const handleStartElection = async (id) => {
    if (confirm('¿Deseas iniciar esta elección ahora?')) {
      try {
        await api.post(`/elections/${id}/start`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.error || 'Error al iniciar la elección');
      }
    }
  };

  const handleFinishElection = async (id) => {
    if (confirm('¿Deseas dar por finalizada esta elección?')) {
      try {
        await api.post(`/elections/${id}/finish`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.error || 'Error al finalizar la elección');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Panel de Control General
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Administración del Sistema Electoral</h1>
          <p className="text-slate-500 text-sm">Gestiona procesos electorales, listas de candidatos, padrón de votantes y logs.</p>
        </div>

        <div className="flex flex-wrap gap-2">
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-8">
        <button
          onClick={() => setActiveTab('elections')}
          className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'elections' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Vote size={18} /> Elecciones y Candidatos
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users size={18} /> Padrón de Votantes
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'audit' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShieldAlert size={18} /> Auditoría e Historial
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : activeTab === 'elections' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {elections.map((el) => (
              <div key={el.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                      el.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      el.status === 'FINALIZED' ? 'bg-slate-100 text-slate-700' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {el.status}
                    </span>
                    <span className="text-xs text-slate-400">Periodo {el.academicPeriod}</span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">{el.name}</h3>
                  <p className="text-sm text-slate-500">{el.description}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    Candidatos inscritos: <span className="font-semibold text-slate-700">{el.candidates?.length || 0}</span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedElectionId(el.id);
                      setShowCandidateModal(true);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <UserPlus size={14} /> + Candidato
                  </button>

                  {el.status === 'SCHEDULED' && (
                    <button
                      onClick={() => handleStartElection(el.id)}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Play size={14} /> Iniciar
                    </button>
                  )}

                  {el.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleFinishElection(el.id)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Square size={14} /> Finalizar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'users' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800">Padrón de Electores Registrados</h3>
            <span className="text-xs font-semibold bg-blue-100 text-primary px-2.5 py-1 rounded-full">
              Total: {users.length} Usuarios
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Rol</th>
                  <th className="px-6 py-3 text-left">Estado</th>
                  <th className="px-6 py-3 text-left">Fecha Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-6 py-4 font-medium text-slate-900">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'TEACHER' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-green-600 font-semibold text-xs flex items-center gap-1">
                        <CheckCircle size={12}/> Activo
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800">Logs de Auditoría y Seguridad</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Acción</th>
                  <th className="px-6 py-3 text-left">IP</th>
                  <th className="px-6 py-3 text-left">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 font-mono text-xs text-slate-800">{log.action}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Nueva Elección */}
      {showElectionModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Crear Nueva Elección</h3>
            <form onSubmit={handleCreateElection} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Nombre de la Elección</label>
                <input
                  type="text"
                  required
                  value={electionForm.name}
                  onChange={(e) => setElectionForm({...electionForm, name: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Ej: Elección de Decano 2026"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Descripción</label>
                <textarea
                  value={electionForm.description}
                  onChange={(e) => setElectionForm({...electionForm, description: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Fecha Inicio</label>
                  <input
                    type="date"
                    required
                    value={electionForm.startDate}
                    onChange={(e) => setElectionForm({...electionForm, startDate: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Fecha Fin</label>
                  <input
                    type="date"
                    required
                    value={electionForm.endDate}
                    onChange={(e) => setElectionForm({...electionForm, endDate: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowElectionModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-blue-900 text-white rounded-lg text-sm font-semibold"
                >
                  Guardar Elección
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nuevo Candidato */}
      {showCandidateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Agregar Candidato</h3>
            <form onSubmit={handleCreateCandidate} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={candidateForm.fullName}
                  onChange={(e) => setCandidateForm({...candidateForm, fullName: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none"
                  placeholder="Ej: Dr. Roberto Carlos Sánchez"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Número de Lista</label>
                  <input
                    type="text"
                    required
                    value={candidateForm.listNumber}
                    onChange={(e) => setCandidateForm({...candidateForm, listNumber: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                    placeholder="Ej: 1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Movimiento Político</label>
                  <input
                    type="text"
                    value={candidateForm.politicalMovement}
                    onChange={(e) => setCandidateForm({...candidateForm, politicalMovement: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                    placeholder="Ej: Frente Institucional"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Plan de Trabajo Resumido</label>
                <textarea
                  value={candidateForm.workPlan}
                  onChange={(e) => setCandidateForm({...candidateForm, workPlan: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCandidateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-blue-900 text-white rounded-lg text-sm font-semibold"
                >
                  Guardar Candidato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
