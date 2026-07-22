import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, User as UserIcon, CheckCircle2, AlertTriangle } from 'lucide-react';

const Voting = () => {
  const { id: electionId } = useParams();
  const navigate = useNavigate();
  
  const [candidates, setCandidates] = useState([]);
  const [credentialToken, setCredentialToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const initializeVoting = async () => {
      try {
        // 1. Silently request anonymous credential token
        const credResponse = await api.get(`/voting/${electionId}/credential`);
        setCredentialToken(credResponse.data.token);

        // 2. Fetch candidates for this election
        const candResponse = await api.get(`/candidates/election/${electionId}`);
        setCandidates(candResponse.data);
        
      } catch (err) {
        console.error('Error initializing voting:', err);
        setError(err.response?.data?.error?.message || 'Error al inicializar el entorno de votación. Verifica si ya has emitido tu voto.');
      } finally {
        setLoading(false);
      }
    };

    initializeVoting();
  }, [electionId]);

  const handleVoteSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.post('/voting/submit', {
        electionId,
        candidateId: selectedCandidate.id,
        token: credentialToken
      });
      setSuccess(true);
      setShowConfirm(false);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error al emitir el voto.');
      setShowConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [countdown, setCountdown] = useState(10);
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    let timer;
    if (success) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            logout();
            navigate('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [success, logout, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-slate-500 font-medium animate-pulse">Preparando entorno seguro de votación...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-2xl mx-auto text-center mt-10">
        <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Acceso Denegado</h2>
        <p className="text-red-700 mb-6">{error}</p>
        <button 
          onClick={() => navigate('/elections')}
          className="bg-primary hover:bg-blue-900 text-white px-6 py-2 rounded shadow-sm text-sm font-medium transition-colors"
        >
          Volver al Dashboard
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-10 max-w-2xl mx-auto text-center mt-10">
        <div className="mx-auto bg-green-100 text-green-600 rounded-full w-20 h-20 flex items-center justify-center mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Voto Registrado Exitosamente!</h2>
        <p className="text-slate-500 mb-4">
          Tu voto ha sido encriptado e integrado en la cadena de bloques. Ya no puede ser modificado y tu anonimato está garantizado.
        </p>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 inline-block">
          <p className="text-sm font-medium text-blue-900">
            Cerrando sesión automáticamente en <span className="font-bold text-primary text-lg">{countdown}</span> segundos por seguridad...
          </p>
        </div>
        <div>
          <button 
            onClick={() => { logout(); navigate('/login'); }}
            className="bg-primary hover:bg-blue-900 text-white px-8 py-3 rounded-lg shadow-sm font-medium transition-colors"
          >
            Cerrar Sesión Ahora
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center space-x-2 bg-blue-50 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
          <ShieldCheck size={16} />
          <span>Entorno Seguro de Votación</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Selecciona a tu Candidato</h1>
        <p className="text-slate-500 mt-2">Revisa las propuestas y emite tu voto. Este proceso es anónimo e irreversible.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {candidates.map((candidate) => (
          <div 
            key={candidate.id}
            onClick={() => setSelectedCandidate(candidate)}
            className={`cursor-pointer rounded-xl border-2 transition-all duration-200 overflow-hidden bg-white ${
              selectedCandidate?.id === candidate.id 
                ? 'border-primary shadow-md ring-4 ring-primary/10' 
                : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                  {candidate.photoUrl ? (
                    <img src={candidate.photoUrl} alt={candidate.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={32} className="text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Lista {candidate.listNumber}</div>
                  <h3 className="font-bold text-lg text-slate-900 leading-tight">{candidate.fullName}</h3>
                  <p className="text-sm text-primary font-medium">{candidate.politicalMovement}</p>
                </div>
              </div>
              
              {candidate.workPlan && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Plan de Trabajo Resumido:</h4>
                  <ul className="text-sm text-slate-600 space-y-1 whitespace-pre-line">
                    {candidate.workPlan}
                  </ul>
                </div>
              )}
            </div>
            
            <div className={`p-3 text-center text-sm font-medium ${
              selectedCandidate?.id === candidate.id ? 'bg-primary text-white' : 'bg-slate-50 text-slate-500'
            }`}>
              {selectedCandidate?.id === candidate.id ? 'Candidato Seleccionado' : 'Hacer clic para seleccionar'}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-200">
        <button
          onClick={() => setShowConfirm(true)}
          disabled={!selectedCandidate}
          className={`px-8 py-3 rounded-lg font-medium text-lg shadow-sm transition-all ${
            selectedCandidate 
              ? 'bg-primary hover:bg-blue-900 text-white hover:shadow-md' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          Confirmar Voto
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 mb-4">¿Estás seguro de tu voto?</h3>
            <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-100">
              <p className="text-sm text-slate-500 mb-1">Candidato seleccionado:</p>
              <p className="font-bold text-slate-900 text-lg">{selectedCandidate.fullName}</p>
              <p className="text-sm text-primary">{selectedCandidate.politicalMovement}</p>
            </div>
            <p className="text-sm text-slate-500 mb-8">
              Una vez emitido el voto, se generará tu hash criptográfico y no podrás deshacer esta acción ni volver a votar.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleVoteSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary hover:bg-blue-900 text-white font-medium shadow-sm transition-colors flex justify-center items-center"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Sí, Emitir Voto'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Voting;
