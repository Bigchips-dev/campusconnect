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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center py-[40px] px-[20px] w-full">
      {/* Icon */}
      <div className="w-[80px] h-[80px] mb-[32px] rounded-full bg-[#F59E0B] flex items-center justify-center big-bounce-scale">
        <Check className="w-[40px] h-[40px] text-white" strokeWidth={3} />
      </div>

      {/* Header */}
      <div className="w-full">
        <h2 className="text-[3rem] font-[800] text-[#0A0A0A] mb-[8px] animate-step-heading" style={{ animationDelay: '400ms' }}>
          You're all set, {user?.firstName || 'Big'}!
        </h2>
        <p className="text-[1rem] text-[#6B7280] mb-[32px] animate-step-subheading" style={{ animationDelay: '500ms' }}>
          Your profile is ready. Here's what you can do next:
        </p>
      </div>

      {/* Checklist */}
      <div className="w-full max-w-[400px] mb-[40px] flex flex-col gap-[12px] text-left">
        {checklist.map((item, index) => {
          const Icon = item.icon;
          const delay = 600 + index * 100;
          return (
            <div key={index} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-[#E5E7EB] animate-slide-in-left" style={{ animationDelay: `${delay}ms` }}>
              <div className="w-10 h-10 rounded-full bg-[#FAFAFA] flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <span className="font-bold text-sm text-[#0A0A0A]">{item.text}</span>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-[16px] w-full animate-step-btn" style={{ animationDelay: '900ms' }}>
        <button
          onClick={() => handleFinish('/dashboard')}
          className="w-[280px] py-[14px] px-[24px] bg-[#0A0A0A] text-white border-none rounded-[8px] text-[1rem] font-[600] cursor-pointer transition-all duration-200 hover:bg-[#F59E0B] hover:text-[#0A0A0A] active:scale-[0.98]"
        >
          Go to Dashboard
        </button>
        <button
          onClick={() => handleFinish('/services')}
          className="w-[280px] py-[14px] px-[24px] bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] rounded-[8px] text-[1rem] font-[600] cursor-pointer transition-all duration-200 hover:bg-[#FAFAFA] active:scale-[0.98]"
        >
          Explore Services
        </button>
      </div>
    </div>
  );
}
