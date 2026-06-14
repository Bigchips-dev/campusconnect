import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { CATEGORIES } from '../../data/categories';
import { PartyPopper, Search, LayoutDashboard, ArrowRight, CheckCircle2, Sparkles, Check } from 'lucide-react';

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

  const checklist = [
    { text: 'Profile information completed', icon: CheckCircle2 },
    ...(isSeeker ? [{ text: 'Service interests selected', icon: CheckCircle2 }] : []),
    ...(isProvider ? [{ text: 'Service skills configured', icon: CheckCircle2 }] : [])
  ];

  return (
  <div className="flex flex-col items-center text-center 
    pt-10 pb-16 w-full max-w-[640px] mx-auto px-6">

    {/* Amber Circle Icon */}
    <div className="w-20 h-20 mb-6 rounded-full 
      bg-[#F59E0B] flex items-center justify-center 
      big-bounce-scale">
      <Check className="w-10 h-10 text-white" 
        strokeWidth={3} />
    </div>

    {/* Heading */}
    <h2 className="text-5xl font-extrabold 
      text-[#0A0A0A] mb-2">
      You're all set, {user?.firstName || ''}!
    </h2>

    {/* Subheading */}
    <p className="text-base text-[#6B7280] mb-8">
      Your profile is ready. Here's what you 
      can do next:
    </p>

    {/* Checklist */}
    <div className="w-full max-w-[400px] 
      flex flex-col gap-3 mb-10">
      {checklist.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} 
            className="flex items-center gap-4 
            bg-white p-4 rounded-xl 
            border border-[#E5E7EB]">
            <Icon className="w-5 h-5 
              text-[#F59E0B] flex-shrink-0" />
            <span className="font-semibold 
              text-sm text-[#0A0A0A]">
              {item.text}
            </span>
          </div>
        );
      })}
    </div>

    {/* Buttons */}
    <div className="flex flex-col items-center 
      gap-4 w-full">
      <button
        onClick={() => handleFinish('/dashboard')}
        disabled={loading}
        className="w-[280px] py-4 px-6 
          bg-[#0A0A0A] text-white font-semibold 
          text-base rounded-lg hover:bg-[#F59E0B] 
          hover:text-[#0A0A0A] transition-all 
          duration-200 disabled:opacity-50">
        Go to Dashboard
      </button>
      <button
        onClick={() => handleFinish('/services')}
        disabled={loading}
        className="w-[280px] py-4 px-6 
          bg-white text-[#0A0A0A] font-semibold 
          text-base rounded-lg border-2 
          border-[#0A0A0A] hover:bg-[#FAFAFA] 
          transition-all duration-200 
          disabled:opacity-50">
        Explore Services
      </button>
    </div>

  </div>
);
}
