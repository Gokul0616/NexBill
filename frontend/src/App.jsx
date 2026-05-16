import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Customers = lazy(() => import('./pages/Customer/Customers'));
const Plans = lazy(() => import('./pages/Plans'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));
const Invoices = lazy(() => import('./pages/Invoices'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const CustomerDetail = lazy(() => import('./pages/Customer/CustomerDetails'));
const Notifications = lazy(() => import('./pages/Notifications'));
const NotFound = lazy(() => import('./components/NotFound'));

import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { MessageProvider } from './context/MessageContext';
import { ModalProvider } from './context/ModalContext';
import GlobalModal from './components/GlobalModal';
import LoadingScreen from './components/LoadingScreen';


function ProtectedRoute({ children }) {
  const { token } = useContext(AuthContext);
  if (!token) return <Navigate to="/login" replace />;

  return (
    <Suspense fallback={<LoadingScreen fullScreen={true} />}>
      <div className="flex h-screen overflow-hidden bg-white dark:bg-[#0d0d0d] text-gray-900 dark:text-white font-sans transition-colors duration-200">

        {/* Sidebar */}
        <Sidebar />

        {/* Right column */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-[#f6f9fc] dark:bg-[#0f0f10]">

          {/* Header */}
          <Header />

          {/* Scrollable page — soft neutral in light, near-black in dark */}
          <main className="flex-1 overflow-y-auto px-8 py-6 lg:px-10 lg:py-8 scrollbar-slim bg-[#f6f9fc] dark:bg-[#0f0f10]">
            {children}
          </main>

        </div>
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
            <Suspense fallback={<LoadingScreen fullScreen={true} />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected routes */}
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
                <Route path="/customers/:id" element={<ProtectedRoute><CustomerDetail /></ProtectedRoute>} />
                <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
                <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
                <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

                {/* 404 */}
                <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </ModalProvider>
      </MessageProvider>
    </ThemeProvider>
  );
}

export default App;