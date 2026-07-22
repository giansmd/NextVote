import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Clock, ChevronRight, Activity, Archive, LayoutGrid, CheckCircle2 } from 'lucide-react';

const Dashboard = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await api.get('/elections');
        // The backend returns an array directly, not an object with an elections key
        setElections(response.data);
      } catch (error) {
        console.error('Error fetching elections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, []);

  const getStatusBadge = (election) => {
    if (election.status === 'ACTIVE') {
      if (election.hasVoted) {
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 flex items-center gap-1"><CheckCircle2 size={12}/> Voto Emitido</span>;
      }
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center gap-1"><Activity size={12}/> Activa</span>;
    }
    switch (election.status) {
      case 'SCHEDULED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 flex items-center gap-1"><Clock size={12}/> Programada</span>;
      case 'FINALIZED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 flex items-center gap-1"><Archive size={12}/> Finalizada</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{election.status}</span>;
    }
  };

  const handleAction = (election) => {
    if (election.status === 'ACTIVE' && user.role !== 'ADMIN') {
      if (election.hasVoted) {
        navigate(`/blockchain/${election.id}`);
      } else {
        navigate(`/vote/${election.id}`);
      }
    } else if (election.status === 'FINALIZED') {
      navigate(`/blockchain/${election.id}`);
    } else if (user.role === 'ADMIN') {
      navigate(`/blockchain/${election.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Elecciones Universitarias</h1>
          <p className="text-slate-500 mt-1">Listado de procesos electorales disponibles en el sistema.</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="bg-primary hover:bg-blue-900 text-white px-4 py-2 rounded shadow-sm text-sm font-medium transition-colors">
            + Nueva Elección
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {elections.map((election) => (
            <div key={election.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-50 text-primary rounded-lg">
                    <LayoutGrid size={20} />
                  </div>
                   {getStatusBadge(election)}
                </div>
                
                <h3 className="font-bold text-lg text-slate-900 leading-tight mb-2 line-clamp-2">
                  {election.name}
                </h3>
                
                <p className="text-slate-500 text-sm mb-4 line-clamp-3">
                  {election.description || "Sin descripción proporcionada."}
                </p>

                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    <span>Inicia: {new Date(election.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    <span>Finaliza: {new Date(election.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 border-t border-slate-100 p-4">
                <button 
                  onClick={() => handleAction(election)}
                  className="w-full flex items-center justify-between text-sm font-semibold text-primary hover:text-blue-800 transition-colors"
                >
                  <span>
                    {election.status === 'ACTIVE' && user.role !== 'ADMIN' ? (election.hasVoted ? 'Ver Blockchain y Resultados' : 'Ingresar a Votar') : 
                     election.status === 'FINALIZED' ? 'Ver Resultados y Auditoría' : 
                     user.role === 'ADMIN' ? 'Gestionar Elección' : 'Ver Detalles'}
                  </span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
          
          {elections.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
              <p>No hay elecciones disponibles en este momento.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
