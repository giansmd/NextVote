import { useState, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Check } from 'lucide-react';

import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard (or voting)
  if (user) {
    return <Navigate to="/elections" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const loggedUser = await login(email, password);
      
      if (loggedUser.role === 'ADMIN') {
        navigate('/admin');
        return;
      }

      navigate('/elections');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error al iniciar sesión. Verifique sus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Top Navigation Bar */}
      <nav className="w-full bg-primary flex items-center justify-between px-8 py-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="bg-white text-primary font-bold rounded flex items-center justify-center h-8 w-8 text-xl">
            U
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-white font-bold text-lg leading-none">NextVote</span>
            <span className="text-xs text-blue-200">Universidad Nacional de Trujillo</span>
          </div>
        </div>
        <div>
          <button className="bg-white text-primary font-medium px-4 py-2 rounded text-sm hover:bg-slate-100 transition-colors">
            Iniciar Sesión
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          {/* Left Column - Login Form */}
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
            <div className="flex items-center space-x-3 mb-10">
              <div className="bg-primary text-white font-bold rounded flex items-center justify-center h-10 w-10 text-2xl">
                U
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-slate-900 font-bold text-xl leading-none">NextVote UNT</span>
                <span className="text-xs text-slate-500">Sistema Oficial de Votaciones</span>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-2">Iniciar Sesión</h1>
            <p className="text-slate-500 text-sm mb-8">Ingresa tus credenciales para acceder al sistema</p>

            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Identificador (Código o Email)
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                  placeholder="U20210000 / tu@unitru.edu.pe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>

       

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-blue-900 text-white font-medium py-3 rounded-lg transition-colors flex justify-center items-center"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Ingresar al Sistema'
                )}
              </button>
            </form>
          </div>

          {/* Right Column - Info Card */}
          <div className="bg-[#1e3a8a] text-white p-10 rounded-2xl shadow-lg flex flex-col justify-center relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center space-x-3 mb-10 relative z-10">
              <div className="bg-white text-primary font-bold rounded flex items-center justify-center h-12 w-12 text-2xl shadow-sm">
                U
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-2xl leading-none tracking-tight">NextVote</span>
                <span className="text-sm text-blue-200 font-medium">Universidad Nacional de Trujillo</span>
              </div>
            </div>

            <p className="text-blue-100 text-lg leading-relaxed mb-12 relative z-10">
              Plataforma oficial de votaciones digitales de la UNT. Ejerce tu derecho a votar de forma segura, anónima y transparente.
            </p>

            <div className="space-y-6 relative z-10">
              <div className="flex items-start space-x-4">
                <div className="mt-1 flex-shrink-0">
                  <Check className="text-green-400" size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Voto anónimo</h3>
                  <p className="text-blue-200 text-sm">Tu identidad está protegida</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="mt-1 flex-shrink-0">
                  <Check className="text-green-400" size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Seguridad blockchain</h3>
                  <p className="text-blue-200 text-sm">Votos almacenados de forma inmutable</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="mt-1 flex-shrink-0">
                  <Check className="text-green-400" size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Verificación de resultados</h3>
                  <p className="text-blue-200 text-sm">Resultados auditables por todos</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Login;
