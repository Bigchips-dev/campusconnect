import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { CATEGORIES } from '../../data/categories';
import { PartyPopper, Search, LayoutDashboard, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export default function StepComplete({ user, refreshUser }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const isSeeker = user?.activeRoles?.includes('SEEKER');
  const isProvider = user?.activeRoles?.includes('PROVIDER');

  const handleFinish = async (destination) => {
    setLoading(true);
    try {
      await api.post('/onboarding/complete');
      await refreshUser();
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center py-8 space-y-8 animate-fade-in">
      {/* Celebration icon */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-xl shadow-primary-500/25">
          <PartyPopper className="w-12 h-12 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-accent-400 flex items-center justify-center shadow-lg animate-bounce">
          <Sparkles className="w-5 h-5 text-navy-950" />
        </div>
      </div>

      {/* Headline */}
      <div>
        <h1 className="heading-3xl mb-2">
          You're all set, <span className="gradient-text">{user?.firstName}!</span> 🎉
        </h1>
        <p className="text-base" style={{ color: 'var(--text-muted)' }}>
          Your CampusConnect profile is ready to go.
        </p>
      </div>

      {/* Summary */}
      <div className="w-full max-w-sm space-y-3 text-left">
        <div className="surface rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0" />
          <span className="text-sm" style={{ color: 'var(--text-body)' }}>Profile information completed</span>
        </div>
        {isSeeker && (
          <div className="surface rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0" />
            <span className="text-sm" style={{ color: 'var(--text-body)' }}>Service interests selected</span>
          </div>
        )}
        {isProvider && (
          <div className="surface rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0" />
            <span className="text-sm" style={{ color: 'var(--text-body)' }}>Service skills configured</span>
          </div>
        )}
        <div className="surface rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0" />
          <div>
            <span className="text-sm" style={{ color: 'var(--text-body)' }}>
              Roles: {user?.activeRoles?.map((r) => r === 'SEEKER' ? 'Service Seeker' : 'Service Provider').join(' & ')}
            </span>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm pt-2">
        {isSeeker && (
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={() => handleFinish('/services')}
            loading={loading}
          >
            <Search className="w-4 h-4" /> Explore Services
          </Button>
        )}
        <Button
          variant={isSeeker ? 'secondary' : 'primary'}
          size="lg"
          className="flex-1"
          onClick={() => handleFinish('/dashboard')}
          loading={loading}
        >
          <LayoutDashboard className="w-4 h-4" /> View Dashboard
        </Button>
      </div>
    </div>
  );
}
