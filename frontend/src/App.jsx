import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useContext, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';

// Lazy load pages for performance and Suspense support
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Customers = lazy(() => import('./pages/Customers'));
const Plans = lazy(() => import('./pages/Plans'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));
const Invoices = lazy(() => import('./pages/Invoices'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { MessageProvider } from './context/MessageContext';
import { ModalProvider } from './context/ModalContext';
import GlobalModal from './components/GlobalModal';
import LoadingScreen from './components/LoadingScreen';



function ProtectedRoute({ children }) {
  const { token } = useContext(AuthContext);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <Suspense fallback={<LoadingScreen />}>
      <div className="flex h-screen bg-transparent text-gray-900 dark:text-white font-sans transition-colors duration-200">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8 lg:p-12">
          {children}
        </main>
      </div>
    </Suspense>
  );
}

function App() {

  return (
    <ThemeProvider>
      <MessageProvider>
        <ModalProvider>
          <AuthProvider>
            <GlobalModal />
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
                <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
                <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
                <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </ModalProvider>
      </MessageProvider>
    </ThemeProvider>
  );
}

export default App;
