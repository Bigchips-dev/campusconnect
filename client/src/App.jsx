import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ToastContainer from './components/ui/Toast';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import BrowseServices from './pages/BrowseServices';
import ServiceDetail from './pages/ServiceDetail';

// Protected pages
import Dashboard from './pages/Dashboard';
import CreateService from './pages/CreateService';
import MyServices from './pages/MyServices';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import Messages from './pages/Messages';

// Onboarding
import OnboardingLayout from './pages/onboarding/OnboardingLayout';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ToastContainer />
      <main className="flex-1 pt-16">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/services" element={<BrowseServices />} />
          <Route path="/listing/:id" element={<ServiceDetail />} />

          {/* Onboarding — requires auth but NOT onboarding completion */}
          <Route path="/onboarding" element={<OnboardingLayout />} />

          {/* Protected — requires auth + onboarding complete */}
          <Route path="/services/create" element={<ProtectedRoute><CreateService /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/my-services" element={<ProtectedRoute><MyServices /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
