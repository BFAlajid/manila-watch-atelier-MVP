import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner@2.0.3';
import { WatchProvider } from './context/WatchContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ScrollProgress } from './components/ScrollProgress';
import { ComparisonBar } from './components/ComparisonBar';
import { WhatsAppButton } from './components/WhatsAppButton';
import { ProtectedRoute } from './components/admin/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import InventoryPage from './pages/InventoryPage';
import WatchDetailPage from './pages/WatchDetailPage';
import ComparePage from './pages/ComparePage';
import FavoritesPage from './pages/FavoritesPage';
import { AdminPage } from './pages/AdminPage';
import { AdminLogin } from './pages/admin/Login';
import { AdminDashboard } from './pages/admin/Dashboard';

// Re-export types for backward compatibility
export type { Watch, CartItem } from './types/inventory';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WatchProvider>
          <Router>
            <div className="min-h-screen bg-black dark:bg-black light:bg-white transition-colors">
              <ScrollProgress />

            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/watch/:slug" element={<WatchDetailPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>

            <ComparisonBar />
            <WhatsAppButton position="fixed" />

            <Toaster
              position="top-right"
              theme="dark"
              toastOptions={{
                style: {
                  background: '#171717',
                  border: '1px solid #404040',
                  color: '#fff',
                },
              }}
            />
            </div>
          </Router>
        </WatchProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
