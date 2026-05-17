import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useContext, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Customers = lazy(() => import('./pages/Customer/Customers'));
const CreateCustomer = lazy(() => import('./pages/Customer/CreateCustomer'));
const Plans = lazy(() => import('./pages/Plans'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));
const Invoices = lazy(() => import('./pages/Invoices'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const CustomerDetail = lazy(() => import('./pages/Customer/CustomerDetails'));
const Notifications = lazy(() => import('./pages/Notifications'));
const WorkspaceSettings = lazy(() => import('./pages/Settings/WorkspaceSettings'));
const UserSettings = lazy(() => import('./pages/Settings/UserSettings'));
const ActivateAccount = lazy(() => import('./pages/ActivateAccount'));
const NotFound = lazy(() => import('./components/NotFound'));


import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { MessageProvider } from './context/MessageContext';
import { ModalProvider } from './context/ModalContext';
import { BannerProvider, useBanner } from './context/BannerContext';
import GlobalModal from './components/GlobalModal';
import GlobalBanner from './components/GlobalBanner';
import LoadingScreen from './components/LoadingScreen';
import { useEffect } from 'react';




function ProtectedRoute({ children, minimal = false }) {
  const { 
    token, 
    testMode, 
    verificationStatus, 
    verificationComments,
    isBlocked,
    customBannerMessage,
    banners,
    dismissBanner
  } = useContext(AuthContext);
  const { showBanner, hideBanner } = useBanner();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || minimal || !banners) {
      hideBanner();
      return;
    }

    const getBannerByKey = (key) => {
      const b = banners.find(banner => banner.banner_key === key);
      if (!b) return null;
      
      const isEnabled = b.is_enabled === true || b.is_enabled === 'true' || b.is_enabled === 't';
      const isDismissed = b.is_dismissed === true || b.is_dismissed === 'true' || b.is_dismissed === 't';
      
      // Core system banners ignore the dismissal flag to remain persistently visible
      const nonDismissibleKeys = [
        'account-suspended',
        'test-mode',
        'live-verification-review',
        'live-verification-action',
        'live-activation-required'
      ];
      
      const shouldCheckDismissal = !nonDismissibleKeys.includes(key);
      
      if (isEnabled && (!shouldCheckDismissal || !isDismissed)) {
        return b;
      }
      return null;
    };

    // 1. Suspended banner
    const suspendedBanner = getBannerByKey('account-suspended');
    // 2. Custom admin banner
    const adminBanner = getBannerByKey('custom-admin-announcement');
    // 3. Verification under review banner
    const reviewBanner = getBannerByKey('live-verification-review');
    // 4. Verification action required banner
    const actionBanner = getBannerByKey('live-verification-action');
    // 5. Test mode banner
    const testBanner = getBannerByKey('test-mode');
    // 6. Verified success banner
    const verifiedBanner = getBannerByKey('verified-success');
    // 7. Live activation required banner
    const activationBanner = getBannerByKey('live-activation-required');

    const activeCustomBanner = banners.find(b => {
      const isEnabled = b.is_enabled === true || b.is_enabled === 'true' || b.is_enabled === 't';
      const isDismissed = b.is_dismissed === true || b.is_dismissed === 'true' || b.is_dismissed === 't';
      const isSystem = ['account-suspended', 'custom-admin-announcement', 'live-verification-review', 'live-verification-action', 'test-mode', 'verified-success', 'live-activation-required'].includes(b.banner_key);
      return isEnabled && !isDismissed && !isSystem;
    });

    if (isBlocked && suspendedBanner) {
      showBanner(
        suspendedBanner.banner_key,
        suspendedBanner.message,
        suspendedBanner.type,
        suspendedBanner.cta_label ? { label: suspendedBanner.cta_label, onClick: () => navigate(suspendedBanner.cta_link) } : null,
        () => dismissBanner(suspendedBanner.banner_key)
      );
    } else if (activeCustomBanner) {
      showBanner(
        activeCustomBanner.banner_key,
        activeCustomBanner.message,
        activeCustomBanner.type,
        activeCustomBanner.cta_label ? { label: activeCustomBanner.cta_label, onClick: () => navigate(activeCustomBanner.cta_link) } : null,
        () => dismissBanner(activeCustomBanner.banner_key)
      );
    } else if (customBannerMessage && adminBanner) {
      showBanner(
        adminBanner.banner_key,
        customBannerMessage || adminBanner.message,
        adminBanner.type,
        adminBanner.cta_label ? { label: adminBanner.cta_label, onClick: () => navigate(adminBanner.cta_link) } : null,
        () => dismissBanner(adminBanner.banner_key)
      );
    } else if (verificationStatus === 'under_review' && reviewBanner) {
      showBanner(
        reviewBanner.banner_key,
        reviewBanner.message,
        reviewBanner.type,
        reviewBanner.cta_label ? { label: reviewBanner.cta_label, onClick: () => navigate(reviewBanner.cta_link) } : null,
        () => dismissBanner(reviewBanner.banner_key)
      );
    } else if (verificationStatus === 'action_required' && actionBanner) {
      const displayMsg = verificationComments 
        ? `Action Required: Verification Paused. ${verificationComments}` 
        : actionBanner.message;
      showBanner(
        actionBanner.banner_key,
        displayMsg,
        actionBanner.type,
        actionBanner.cta_label ? { label: actionBanner.cta_label, onClick: () => navigate(actionBanner.cta_link) } : null,
        () => dismissBanner(actionBanner.banner_key)
      );
    } else if (testMode && testBanner) {
      showBanner(
        testBanner.banner_key,
        testBanner.message,
        testBanner.type,
        testBanner.cta_label ? { label: testBanner.cta_label, onClick: () => navigate(testBanner.cta_link) } : null,
        () => dismissBanner(testBanner.banner_key)
      );
    } else if (verificationStatus === 'verified' && verifiedBanner) {
      showBanner(
        verifiedBanner.banner_key,
        verifiedBanner.message,
        verifiedBanner.type,
        verifiedBanner.cta_label ? { label: verifiedBanner.cta_label, onClick: () => navigate(verifiedBanner.cta_link) } : null,
        () => dismissBanner(verifiedBanner.banner_key)
      );
    } else if (verificationStatus === 'pending' && !testMode && activationBanner) {
      showBanner(
        activationBanner.banner_key,
        activationBanner.message,
        activationBanner.type,
        activationBanner.cta_label ? { label: activationBanner.cta_label, onClick: () => navigate(activationBanner.cta_link) } : null,
        () => dismissBanner(activationBanner.banner_key)
      );
    } else {
      hideBanner();
    }
  }, [token, testMode, verificationStatus, verificationComments, isBlocked, customBannerMessage, banners, showBanner, hideBanner, minimal, navigate, dismissBanner]);

  if (!token) return <Navigate to="/login" replace />;

  if (minimal) {
    return (
      <Suspense fallback={<LoadingScreen fullScreen={true} />}>
        {children}
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<LoadingScreen fullScreen={true} />}>
      <div className="flex h-screen overflow-hidden bg-white dark:bg-[#0d0d0d] text-gray-900 dark:text-white font-sans transition-colors duration-200">

        {/* Sidebar */}
        <Sidebar />

        {/* Right column */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-[#f6f9fc] dark:bg-[#0f0f10]">
          {/* Banner */}
          <GlobalBanner />

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
          <BannerProvider>
            <AuthProvider>
              <GlobalModal />

              <Suspense fallback={<LoadingScreen fullScreen={true} />}>
                <Routes>
                  {/* Public / Full-screen routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/404" element={<NotFound />} />

                  {/* Protected routes (with App Chrome) */}
                  <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
                  <Route path="/customers/new" element={<ProtectedRoute><CreateCustomer /></ProtectedRoute>} />
                  <Route path="/customers/:id" element={<ProtectedRoute><CustomerDetail /></ProtectedRoute>} />
                  <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
                  <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
                  <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><WorkspaceSettings /></ProtectedRoute>} />
                  <Route path="/account" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
                  <Route path="/activate" element={<ProtectedRoute minimal={true}><ActivateAccount /></ProtectedRoute>} />

                  {/* 404 Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </AuthProvider>
          </BannerProvider>
        </ModalProvider>
      </MessageProvider>
    </ThemeProvider>
  );
}

export default App;