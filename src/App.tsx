import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import { WatchProvider } from './context/WatchContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ScrollProgress } from './components/ScrollProgress';
import { ComparisonBar } from './components/ComparisonBar';
import { WhatsAppButton } from './components/WhatsAppButton';
import { ProtectedRoute } from './components/admin/ProtectedRoute';

// Lazy-loaded pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const InventoryPage = lazy(() => import('./pages/InventoryPage'));
const WatchDetailPage = lazy(() => import('./pages/WatchDetailPage'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const InsightsPage = lazy(() => import('./pages/InsightsPage'));
const BrandPage = lazy(() => import('./pages/BrandPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const SoldArchivePage = lazy(() => import('./pages/SoldArchivePage'));
const AdminLogin = lazy(() => import('./pages/admin/Login').then(m => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.AdminDashboard })));

// Re-export types for backward compatibility
export type { Watch } from './types/inventory';

function PageLoader() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
                <Route path="/" element={<HomePage />} />
                <Route path="/homepage" element={<HomePage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/watch/:slug" element={<WatchDetailPage />} />
                <Route path="/watches/:brand" element={<BrandPage />} />
                <Route path="/insights" element={<InsightsPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/sold" element={<SoldArchivePage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <WatchProvider>
            <Router>
              <div className="min-h-screen bg-black dark:bg-black light:bg-white transition-colors">
                <ScrollProgress />
                <AnimatedRoutes />

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
    </HelmetProvider>
  );
}

export default App;
