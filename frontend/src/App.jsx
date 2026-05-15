import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Plans from './pages/Plans';
import Subscriptions from './pages/Subscriptions';
import Invoices from './pages/Invoices';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { MessageProvider } from './context/MessageContext';
import { ModalProvider } from './context/ModalContext';
import GlobalModal from './components/GlobalModal';

function ProtectedRoute({ children }) {
  const { token } = useContext(AuthContext);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="flex h-screen bg-transparent text-gray-900 dark:text-white font-sans transition-colors duration-200">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <MessageProvider>
        <ModalProvider>
          <AuthProvider>
            <GlobalModal />
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
          </AuthProvider>
        </ModalProvider>
      </MessageProvider>
    </ThemeProvider>
  );
}

export default App;
