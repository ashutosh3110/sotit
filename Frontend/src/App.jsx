import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Lenis from 'lenis';
import { LocationProvider } from './context/LocationContext';

// Shared Components
import Loader from './shared/components/Loader';
import AppHeader from './shared/components/Header'; // Fixed name
import UserBottomNav from './shared/components/BottomNav'; // Renamed
import ScrollToTop from './shared/components/ScrollToTop';

// Modular Pages (Lazy Loaded for performance)
const UserHome = lazy(() => import('./modules/user/pages/UserHome'));
const UserLogin = lazy(() => import('./modules/user/pages/UserLogin'));
const UserRegister = lazy(() => import('./modules/user/pages/UserRegister'));
const AuthLanding = lazy(() => import('./modules/auth/pages/AuthLanding'));
const WelcomePage = lazy(() => import('./modules/auth/pages/WelcomePage'));
const UserProfile = lazy(() => import('./modules/user/pages/UserProfile'));
const UserFind = lazy(() => import('./modules/user/pages/UserFind'));
const UserSearch = lazy(() => import('./modules/user/pages/UserSearch'));
const UserOrders = lazy(() => import('./modules/user/pages/UserOrders'));
const UserOrderDetail = lazy(() => import('./modules/user/pages/UserOrderDetail'));
const UserSupport = lazy(() => import('./modules/user/pages/UserSupport'));
const UserReviews = lazy(() => import('./modules/user/pages/UserReviews'));
const UserPreferences = lazy(() => import('./modules/user/pages/UserPreferences'));
const UserHistory = lazy(() => import('./modules/user/pages/UserHistory'));
const UserBookingSuccess = lazy(() => import('./modules/user/pages/UserBookingSuccess'));
const CategoryDetails = lazy(() => import('./modules/user/pages/CategoryDetails'));
const UserPersonalInfo = lazy(() => import('./modules/user/pages/UserPersonalInfo'));
const UserWallet = lazy(() => import('./modules/user/pages/UserWallet'));
const PremiumSelection = lazy(() => import('./modules/user/pages/PremiumSelectionPage'));
const VendorHome = lazy(() => import('./modules/vendor/pages/VendorHome'));
const VendorLogin = lazy(() => import('./modules/vendor/pages/VendorLogin'));
const VendorRegister = lazy(() => import('./modules/vendor/pages/VendorRegister'));
const VendorJobs = lazy(() => import('./modules/vendor/pages/VendorJobs'));
const VendorWallet = lazy(() => import('./modules/vendor/pages/VendorWallet'));
const VendorSettings = lazy(() => import('./modules/vendor/pages/VendorSettings'));
const VendorProfile = lazy(() => import('./modules/vendor/pages/VendorProfile'));
const VendorPersonal = lazy(() => import('./modules/vendor/pages/VendorPersonal'));
const VendorExpertise = lazy(() => import('./modules/vendor/pages/VendorExpertise'));
const VendorKYC = lazy(() => import('./modules/vendor/pages/VendorKYC'));
const VendorRoles = lazy(() => import('./modules/vendor/pages/VendorRoles'));
const VendorSupport = lazy(() => import('./modules/vendor/pages/VendorSupport'));
const VendorHistory = lazy(() => import('./modules/vendor/pages/VendorHistory'));
const AdminDashboard = lazy(() => import('./modules/admin/pages/AdminDashboard'));
const AdminUsers = lazy(() => import('./modules/admin/pages/AdminUsers'));
const AdminVendors = lazy(() => import('./modules/admin/pages/AdminVendors'));
const AdminRatings = lazy(() => import('./modules/admin/pages/AdminRatings'));
const AdminJobs = lazy(() => import('./modules/admin/pages/AdminJobs'));
const AdminApprovals = lazy(() => import('./modules/admin/pages/AdminApprovals'));
const AdminSettings = lazy(() => import('./modules/admin/pages/AdminSettings'));
const AdminBanners = lazy(() => import('./modules/admin/pages/AdminBanners'));
const AdminSupport = lazy(() => import('./modules/admin/pages/AdminSupport'));
const AdminFAQs = lazy(() => import('./modules/admin/pages/AdminFAQs'));
const AdminWallet = lazy(() => import('./modules/admin/pages/AdminWallet'));
const AdminLogin = lazy(() => import('./modules/admin/pages/AdminLogin'));
const OwnerDashboard = lazy(() => import('./modules/owner/pages/OwnerDashboard'));
const RequirementForm = lazy(() => import('./modules/owner/pages/RequirementForm'));
const AboutContact = lazy(() => import('./modules/landing/pages/AboutContact'));
import { AdminSecurity, AdminNotifications, AdminPlatform, AdminProfile } from './modules/admin/pages/AdminSubSettings';

// Page Transition Component
const ModuleWrapper = ({ children, type }) => (
  <motion.div
    initial={{ opacity: 0, x: type === 'vendor' ? 50 : -50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 50 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="flex-1 min-h-screen" 
  >
    {children}
  </motion.div>
);

const AppRoutes = () => {
  const location = useLocation();

  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-white">
      <div className="h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
    </div>}>
      <div className="flex-1 flex flex-col min-h-screen">
        <Routes location={location} key={location.pathname}>
          {/* Main Auth Gateway */}
          <Route path="/" element={<WelcomePage />} />
          <Route path="/about" element={<AboutContact />} />
          <Route path="/auth" element={<AuthLanding />} />
          <Route path="/user/auth" element={<Navigate to="/auth" replace />} />

          {/* User App Module */}
          <Route path="/user" element={<ModuleWrapper type="user"><UserHome /></ModuleWrapper>} />
          <Route path="/user/login" element={<Navigate to="/auth?tab=user" replace />} />
          <Route path="/user/register" element={<ModuleWrapper type="user"><UserRegister /></ModuleWrapper>} />
          <Route path="/user/profile" element={<ModuleWrapper type="user"><UserProfile /></ModuleWrapper>} />
          <Route path="/user/profile/edit" element={<ModuleWrapper type="user"><UserPersonalInfo /></ModuleWrapper>} />
          <Route path="/user/find" element={<ModuleWrapper type="user"><UserFind /></ModuleWrapper>} />
          <Route path="/user/search" element={<ModuleWrapper type="user"><UserSearch /></ModuleWrapper>} />
          <Route path="/user/orders" element={<ModuleWrapper type="user"><UserOrders /></ModuleWrapper>} />
          <Route path="/user/order/:id" element={<ModuleWrapper type="user"><UserOrderDetail /></ModuleWrapper>} />
          <Route path="/user/support" element={<ModuleWrapper type="user"><UserSupport /></ModuleWrapper>} />
          <Route path="/user/reviews" element={<ModuleWrapper type="user"><UserReviews /></ModuleWrapper>} />
          <Route path="/user/preferences" element={<ModuleWrapper type="user"><UserPreferences /></ModuleWrapper>} />
          <Route path="/user/history" element={<ModuleWrapper type="user"><UserHistory /></ModuleWrapper>} />
          <Route path="/user/category/:category" element={<ModuleWrapper type="user"><CategoryDetails /></ModuleWrapper>} />
          <Route path="/user/premium-selection" element={<ModuleWrapper type="user"><PremiumSelection /></ModuleWrapper>} />
          <Route path="/user/booking-success" element={<ModuleWrapper type="user"><UserBookingSuccess /></ModuleWrapper>} />
          
          {/* Vendor App Module (Drivers, Mechanics, RTO, Legal, Towing) */}
          <Route path="/vendor" element={<ModuleWrapper type="vendor"><VendorHome /></ModuleWrapper>} />
          <Route path="/vendor/login" element={<Navigate to="/auth?tab=vendor" replace />} />
          <Route path="/vendor/register" element={<ModuleWrapper type="vendor"><VendorRegister /></ModuleWrapper>} />
          <Route path="/vendor/register/personal" element={<ModuleWrapper type="vendor"><VendorPersonal /></ModuleWrapper>} />
          <Route path="/vendor/register/expertise" element={<ModuleWrapper type="vendor"><VendorExpertise /></ModuleWrapper>} />
          <Route path="/vendor/jobs" element={<ModuleWrapper type="vendor"><VendorJobs /></ModuleWrapper>} />
          <Route path="/vendor/settings" element={<ModuleWrapper type="vendor"><VendorSettings /></ModuleWrapper>} />
          <Route path="/vendor/profile" element={<ModuleWrapper type="vendor"><VendorProfile /></ModuleWrapper>} />
          <Route path="/vendor/kyc" element={<ModuleWrapper type="vendor"><VendorKYC /></ModuleWrapper>} />
          <Route path="/vendor/roles" element={<ModuleWrapper type="vendor"><VendorRoles /></ModuleWrapper>} />
          <Route path="/vendor/support" element={<ModuleWrapper type="vendor"><VendorSupport /></ModuleWrapper>} />
          <Route path="/vendor/history" element={<ModuleWrapper type="vendor"><VendorHistory /></ModuleWrapper>} />
          
          {/* Owner App Module */}
          <Route path="/owner-dashboard" element={<ModuleWrapper type="owner"><OwnerDashboard /></ModuleWrapper>} />
          <Route path="/post-requirement" element={<ModuleWrapper type="owner"><RequirementForm /></ModuleWrapper>} />
          
          {/* Admin App Module */}
          <Route path="/admin/login" element={<ModuleWrapper type="admin"><AdminLogin /></ModuleWrapper>} />
          <Route path="/admin" element={<Navigate to="/admin/vendors" replace />} />
          <Route path="/admin/users" element={<ModuleWrapper type="admin"><AdminUsers /></ModuleWrapper>} />
          <Route path="/admin/vendors" element={<ModuleWrapper type="admin"><AdminVendors /></ModuleWrapper>} />
          <Route path="/admin/ratings" element={<ModuleWrapper type="admin"><AdminRatings /></ModuleWrapper>} />
          <Route path="/admin/jobs" element={<ModuleWrapper type="admin"><AdminJobs /></ModuleWrapper>} />
          <Route path="/admin/approvals" element={<ModuleWrapper type="admin"><AdminApprovals /></ModuleWrapper>} />
          <Route path="/admin/settings" element={<ModuleWrapper type="admin"><AdminSettings /></ModuleWrapper>} />
          <Route path="/admin/settings/security" element={<ModuleWrapper type="admin"><AdminSecurity /></ModuleWrapper>} />
          <Route path="/admin/settings/notifications" element={<ModuleWrapper type="admin"><AdminNotifications /></ModuleWrapper>} />
          <Route path="/admin/settings/platform" element={<ModuleWrapper type="admin"><AdminPlatform /></ModuleWrapper>} />
          <Route path="/admin/settings/profile" element={<ModuleWrapper type="admin"><AdminProfile /></ModuleWrapper>} />
          <Route path="/admin/banners" element={<ModuleWrapper type="admin"><AdminBanners /></ModuleWrapper>} />
          <Route path="/admin/support" element={<ModuleWrapper type="admin"><AdminSupport /></ModuleWrapper>} />
          <Route path="/admin/faqs" element={<ModuleWrapper type="admin"><AdminFAQs /></ModuleWrapper>} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/user" replace />} />
        </Routes>
      </div>
    </Suspense>
  );
};

const AppContent = () => {
  const location = useLocation();
  const authPaths = ['/', '/about', '/auth', '/user/login', '/user/register', '/vendor/login', '/vendor/register', '/vendor/register/personal', '/vendor/register/expertise'];
  const isAuthPage = authPaths.includes(location.pathname) || location.pathname.startsWith('/admin');

  const isAdminPage = location.pathname.startsWith('/admin');
  const isAboutPage = location.pathname === '/about';

  return (
    <div className={`${(!isAdminPage && !isAboutPage) ? 'app-shell border-x border-black/5 ring-1 ring-black/[0.02]' : 'min-h-screen bg-slate-50'} ${!isAuthPage ? 'pb-20' : ''}`}>
      {!isAuthPage && <AppHeader />}
      <AppRoutes />
      {!isAuthPage && <UserBottomNav />}
    </div>
  );
};

import { Toaster } from 'react-hot-toast';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1,
      smoothWheel: true,
      smoothTouch: false,
    });
    window.lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const preventZoom = (e) => {
      if (e.touches && e.touches.length > 1) e.preventDefault();
    };
    
    const preventWheelZoom = (e) => {
      if (e.ctrlKey) e.preventDefault();
    };

    document.addEventListener('touchstart', preventZoom, { passive: false });
    document.addEventListener('wheel', preventWheelZoom, { passive: false });

    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => {
      clearTimeout(timer);
      lenis.destroy();
      document.removeEventListener('touchstart', preventZoom);
      document.removeEventListener('wheel', preventWheelZoom);
    };
  }, []);

  return (
    <Router>
      <LocationProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <div className="relative min-h-screen bg-slate-200/50 font-sans selection:bg-[#C44545]/30 selection:text-[#C44545] antialiased">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <Loader key="main-loader" />
            ) : (
              <motion.div 
                key="main-app-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ScrollToTop />
                <AppContent />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </LocationProvider>
    </Router>
  );
}

export default App;
