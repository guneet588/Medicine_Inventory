import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import PharmacyDashboard from './pages/PharmacyDashboard';
import WarehouseDashboard from './pages/WarehouseDashboard';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { user, loading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route 
        path="/auth" 
        element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} 
      />
      <Route
        path="/dashboard"
        element={
          user ? (
            <Layout>
              {user.user_metadata?.role === 'warehouse' ? (
                <WarehouseDashboard />
              ) : (
                <PharmacyDashboard />
              )}
            </Layout>
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      <Route 
        path="/" 
        element={<Navigate to="/dashboard" replace />} 
      />
    </Routes>
  );
}

export default App;