import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import StepProfile from './StepProfile';
import StepInterests from './StepInterests';
import StepServices from './StepServices';
import StepComplete from './StepComplete';
import { Loader2, Sparkles } from 'lucide-react';

export default function OnboardingLayout() {
  const { user, isOnboarded, refreshUser } = useAuth();
  const [progress, setProgress] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [displayIdx, setDisplayIdx] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [direction, setDirection] = useState('forward');
  const [loading, setLoading] = useState(true);
  const [stepProgress, setStepProgress] = useState({ current: 0, total: 1, title: '' });

  // If already onboarded, redirect
  if (isOnboarded) return <Navigate to="/dashboard" replace />;

  // Determine which steps to show based on roles
  const isSeeker = user?.activeRoles?.includes('SEEKER');
  const isProvider = user?.activeRoles?.includes('PROVIDER');

  const steps = [
    { key: 'profile', title: 'About You', component: StepProfile },
    ...(isSeeker ? [{ key: 'interests', title: 'Your Interests', component: StepInterests }] : []),
    ...(isProvider ? [{ key: 'services', title: 'Your Services', component: StepServices }] : []),
    { key: 'complete', title: 'All Set!', component: StepComplete },
  ];

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data } = await api.get('/onboarding/progress');
        // Resume from where user left off
        const dbStep = data.data.step || 0;
        if (dbStep >= 1) {
          const stepKeys = steps.map((s) => s.key);
          if (dbStep >= 3 && !stepKeys.includes('complete')) {
            setDisplayIdx(steps.length - 1);
          } else if (dbStep >= 3) {
            setDisplayIdx(steps.length - 1);
          } else if (dbStep >= 2) {
            const servicesIdx = stepKeys.indexOf('services');
            setDisplayIdx(servicesIdx >= 0 ? servicesIdx : steps.length - 1);
          } else if (dbStep >= 1) {
            setDisplayIdx(1);
          }
        }
      } catch (err) {
        console.error('Failed to fetch onboarding progress:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  // Hide global header and footer
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    if (header) header.style.display = 'none';
    if (footer) footer.style.display = 'none';
    return () => {
      if (header) header.style.display = '';
      if (footer) footer.style.display = '';
    };
  }, []);

  const goNext = () => {
    if (displayIdx < steps.length - 1) {
      setDisplayIdx(displayIdx + 1);
    }
  };

  const goBack = () => {
    if (displayIdx > 0) {
      setDisplayIdx(displayIdx - 1);
    }
  };

  if (!user) return <Navigate to="/login" replace />;
  if (user.onboardingComplete) return <Navigate to="/dashboard" replace />;
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const StepComponent = steps[displayIdx].component;
  const isLast = steps[displayIdx].key === 'complete';
  const progressPercent = Math.round((stepProgress.current / Math.max(stepProgress.total, 1)) * 100);

  return (
    <div className="min-h-screen h-screen flex overflow-hidden font-['Plus_Jakarta_Sans'] text-[#0A0A0A] bg-white">
      {/* Mobile Thin Progress Bar */}
      {!isLast && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#E5E7EB] md:hidden z-50">
          <div 
            className="h-full bg-[#F59E0B] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Left Panel (80%) */}
      <div className="flex-1 flex flex-col relative h-full overflow-y-auto">
        {/* Logo */}
        <div className="absolute top-6 left-6 z-10">
          <Link to="/" className="text-xl font-bold tracking-tight text-[#0A0A0A]">
            Campus<span className="text-[#F59E0B]">Connect</span>
          </Link>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center w-full min-h-full">
          <div className="w-full max-w-[560px] px-6 py-20 flex flex-col items-center justify-center relative">
            <StepComponent
              onNext={goNext}
              onBack={displayIdx > 0 ? goBack : null}
              user={user}
              refreshUser={refreshUser}
              setStepProgress={setStepProgress}
            />
          </div>
        </div>
      </div>

      {/* Right Panel (20%) - Vertical Progress */}
      {!isLast && (
        <div className="hidden md:flex w-[20%] min-w-[240px] max-w-[320px] bg-[#FAFAFA] border-l border-[#E5E7EB] flex-col justify-between p-8">
          <div>
            <h3 className="text-sm font-bold text-[#6B7280] mb-8">{stepProgress.title || steps[displayIdx].title}</h3>
            <div className="flex flex-col gap-4">
              {Array.from({ length: stepProgress.total }).map((_, idx) => {
                const isAnswered = idx < stepProgress.current;
                const isCurrent = idx === stepProgress.current;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div 
                      className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                        isAnswered ? 'bg-[#F59E0B]' : isCurrent ? 'bg-[#0A0A0A]' : 'bg-[#E5E7EB]'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="text-sm font-bold text-[#F59E0B]">
            {progressPercent}% completed
          </div>
        </div>
      )}
    </div>
  );
}
