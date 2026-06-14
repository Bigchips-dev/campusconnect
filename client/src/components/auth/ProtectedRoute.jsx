import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

/**
 * Wraps protected routes:
 * 1. Not logged in → /login
 * 2. Logged in but onboarding incomplete → /onboarding
 * 3. Otherwise → render children
 */
export default function ProtectedRoute({ children }) {
  const { user, loading, isOnboarded } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#F59E0B]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to onboarding if not complete (but don't redirect if already there)
  if (!isOnboarded && !location.pathname.startsWith('/onboarding')) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
