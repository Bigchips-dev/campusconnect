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
    <div className="flex flex-col items-center text-center py-12 space-y-8 animate-fade-in w-full max-w-sm mx-auto">
      {/* Celebration icon */}
      <div className="w-24 h-24 rounded-full flex items-center justify-center bg-[#F59E0B]/10 border-4 border-[#F59E0B]">
        <CheckCircle2 className="w-12 h-12 text-[#F59E0B]" />
      </div>

      {/* Headline */}
      <div>
        <h1 className="text-3xl font-bold text-[#0A0A0A] mb-2">
          You're all set, {user?.firstName}!
        </h1>
        <p className="text-[#6B7280]">
          Your CampusConnect profile is ready to go.
        </p>
      </div>

      {/* Summary Checklist */}
      <div className="w-full space-y-3 text-left">
        <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#F59E0B] flex-shrink-0" />
          <span className="text-sm font-medium text-[#0A0A0A]">Profile information completed</span>
        </div>
        {isSeeker && (
          <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#F59E0B] flex-shrink-0" />
            <span className="text-sm font-medium text-[#0A0A0A]">Service interests selected</span>
          </div>
        )}
        {isProvider && (
          <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#F59E0B] flex-shrink-0" />
            <span className="text-sm font-medium text-[#0A0A0A]">Service skills configured</span>
          </div>
        )}
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3 w-full pt-4">
        {isSeeker && (
          <button
            onClick={() => handleFinish('/services')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#0A0A0A] text-white rounded-xl font-bold transition-colors hover:bg-[#F59E0B] hover:text-[#0A0A0A] disabled:opacity-50"
          >
            {loading ? 'Finishing...' : 'Explore Services'}
          </button>
        )}
        <button
          onClick={() => handleFinish('/dashboard')}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-colors disabled:opacity-50 ${
            isSeeker
              ? 'bg-white text-[#0A0A0A] border border-[#0A0A0A] hover:bg-[#F59E0B] hover:border-[#F59E0B]'
              : 'bg-[#0A0A0A] text-white hover:bg-[#F59E0B] hover:text-[#0A0A0A]'
          }`}
        >
          {loading ? 'Finishing...' : 'View Dashboard'}
        </button>
      </div>
    </div>
  );
}
