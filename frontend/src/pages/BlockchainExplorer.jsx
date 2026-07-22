import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ShieldCheck, Database, Key, Hash, Link as LinkIcon, BarChart3, Users } from 'lucide-react';

const BlockchainExplorer = () => {
  const { id: electionId } = useParams();
  const navigate = useNavigate();
  
  const [blocks, setBlocks] = useState([]);
  const [results, setResults] = useState([]);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('results'); // 'results' or 'blocks'
  
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'REAL'
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [blocksRes, resultsRes, verifyRes] = await Promise.all([
          api.get(`/blockchain/${electionId}/blocks`),
          api.get(`/blockchain/${electionId}/results`),
          api.get(`/blockchain/${electionId}/verify`)
        ]);
        
        setBlocks(blocksRes.data);
        setResults(resultsRes.data.candidates || []);
        setVerification(verifyRes.data);
      } catch (err) {
        console.error('Error fetching blockchain data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [electionId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Calculate total votes for percentage
  const totalVotes = results.reduce((acc, curr) => acc + (curr.weightedVotes || 0), 0);

  // Pagination and Filtering
  const filteredBlocks = blocks.filter(b => {
    if (filterType === 'REAL') return !b.isDummy && b.index > 0;
    return true;
  });

  const totalPages = Math.ceil(filteredBlocks.length / itemsPerPage);
  const paginatedBlocks = filteredBlocks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-6">
        <div>
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-primary px-3 py-1 rounded-full text-sm font-medium mb-3">
            <ShieldCheck size={16} />
            <span>Auditoría Blockchain</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Resultados y Explorador</h1>
          <p className="text-slate-500 mt-1">Verifica la integridad de la cadena y visualiza los resultados ponderados.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'results' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <div className="flex items-center gap-2"><BarChart3 size={16}/> Resultados</div>
          </button>
          <button 
            onClick={() => setActiveTab('blocks')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'blocks' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <div className="flex items-center gap-2"><Database size={16}/> Explorador de Bloques</div>
          </button>
        </div>
      </div>

      {verification && (
        <div className={`p-4 rounded-xl border flex items-start gap-4 mb-8 ${verification.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className={`p-2 rounded-full ${verification.isValid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className={`font-bold text-lg ${verification.isValid ? 'text-green-800' : 'text-red-800'}`}>
              {verification.isValid ? 'Cadena de Bloques Íntegra y Verificada' : 'Alerta de Integridad en la Cadena'}
            </h3>
            <p className={verification.isValid ? 'text-green-700' : 'text-red-700'}>
              {verification.isValid 
                ? 'Todos los hashes criptográficos y enlaces entre bloques son matemáticamente correctos. No se ha detectado ninguna alteración.' 
                : 'Se ha detectado una anomalía en la validación de los hashes criptográficos.'}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'results' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Conteo Ponderado de Votos</h2>
            {results.map((c, index) => {
              const percentage = totalVotes > 0 ? ((c.weightedVotes / totalVotes) * 100).toFixed(1) : 0;
              return (
                <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                  {/* Progress bar background */}
                  <div 
                    className="absolute top-0 left-0 bottom-0 bg-blue-50 z-0 transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                  ></div>
                  
                  <div className="relative z-10 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{c.fullName}</h3>
                      <p className="text-sm text-slate-500">Lista {c.listNumber} • {c.politicalMovement}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">{percentage}%</div>
                      <div className="text-sm font-medium text-slate-600">{c.weightedVotes} puntos</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Users size={18} className="text-primary"/> Estadísticas
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Votos emitidos (Real)</span>
                  <span className="font-bold text-slate-800">{verification?.validVotesCount || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Votos de ruido (Dummy)</span>
                  <span className="font-bold text-slate-800">{blocks.filter(b => b.isDummy).length}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Total Puntos Ponderados</span>
                  <span className="font-bold text-primary text-lg">{totalVotes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Total Bloques</span>
                  <span className="font-bold text-slate-800">{blocks.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-xl font-bold text-slate-800">Registro Inmutable (Ledger)</h2>
            <select 
              value={filterType} 
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">Todos los Registros</option>
              <option value="REAL">Solo Votos Reales</option>
            </select>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bloque</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tipo</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hash Actual</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {paginatedBlocks.map((block) => (
                    <tr key={block.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${block.index === 0 ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            #{block.index}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {block.index === 0 ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            Génesis
                          </span>
                        ) : block.isDummy ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-600">
                            Dummy (Ruido)
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Voto Real
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Hash size={14} className="text-slate-400" />
                          <span className="text-sm font-mono text-slate-700 truncate max-w-[200px]" title={block.blockHash}>
                            {block.blockHash.substring(0, 16)}...
                          </span>
                        </div>
                        {block.index > 0 && (
                          <div className="flex items-center gap-2 mt-1">
                            <LinkIcon size={12} className="text-slate-300" />
                            <span className="text-xs font-mono text-slate-400 truncate max-w-[200px]" title={block.previousHash}>
                              Prev: {block.previousHash.substring(0, 12)}...
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(block.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm disabled:opacity-50 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Anterior
                </button>
                <span className="text-sm text-slate-600 font-medium">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm disabled:opacity-50 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockchainExplorer;
