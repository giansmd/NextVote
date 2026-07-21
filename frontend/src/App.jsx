import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Voting from './pages/Voting';
import BlockchainExplorer from './pages/BlockchainExplorer';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="/elections" replace />} />
            <Route path="elections" element={<Dashboard />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="vote/:id" element={<Voting />} />
            <Route path="blockchain/:id" element={<BlockchainExplorer />} />
          </Route>

          <Route path="*" element={<Navigate to="/elections" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
