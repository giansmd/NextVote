import { useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Vote, ShieldCheck } from 'lucide-react';

const MainLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      {/* Navbar */}
      <header className="bg-primary text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-white text-primary font-bold rounded flex items-center justify-center h-8 w-8 text-xl">
                U
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-lg leading-none">NextVote</span>
                <span className="text-xs text-blue-200">Universidad Nacional de Trujillo</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors"
                >
                  Panel Admin
                </button>
              )}
              <button
                onClick={() => navigate('/elections')}
                className="text-sm font-medium hover:text-blue-200 transition-colors"
              >
                Elecciones
              </button>
              <div className="text-sm text-right hidden sm:block">
                <p className="font-semibold">{user?.email}</p>
                <p className="text-blue-200 capitalize">{user?.role?.toLowerCase()}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-1 bg-blue-800 hover:bg-blue-700 px-3 py-2 rounded transition-colors text-sm font-medium"
              >
                <LogOut size={16} />
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          NextVote UNT &copy; {new Date().getFullYear()} - Sistema Seguro de Votación Digital
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
