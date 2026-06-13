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

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data } = await api.get('/onboarding/progress');
        setProgress(data.data);

        // Resume from where user left off
        const dbStep = data.data.step || 0;
        if (dbStep >= 1) {
          // Find the step index to resume at
          const stepKeys = steps.map((s) => s.key);
          if (dbStep >= 3 && !stepKeys.includes('complete')) {
            setCurrentIdx(steps.length - 1);
            setDisplayIdx(steps.length - 1);
          } else if (dbStep >= 3) {
            setCurrentIdx(steps.length - 1); // complete
            setDisplayIdx(steps.length - 1);
          } else if (dbStep >= 2) {
            // After interests, find services or complete
            const servicesIdx = stepKeys.indexOf('services');
            setCurrentIdx(servicesIdx >= 0 ? servicesIdx : steps.length - 1);
            setDisplayIdx(servicesIdx >= 0 ? servicesIdx : steps.length - 1);
          } else if (dbStep >= 1) {
            // After profile, find interests or services or complete
            setCurrentIdx(1);
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

  // Hide global header and footer during onboarding
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
    if (currentIdx < steps.length - 1) {
      setDirection('forward');
      setIsExiting(true);
      setTimeout(() => {
        setCurrentIdx(currentIdx + 1);
        setDisplayIdx(currentIdx + 1);
        setIsExiting(false);
      }, 350);
    }
  };

  const goBack = () => {
    if (currentIdx > 0) {
      setDirection('backward');
      setIsExiting(true);
      setTimeout(() => {
        setCurrentIdx(currentIdx - 1);
        setDisplayIdx(currentIdx - 1);
        setIsExiting(false);
      }, 350);
    }
  };

  if (!user) return <Navigate to="/login" replace />;
  if (user.onboardingComplete) return <Navigate to="/dashboard" replace />;
  if (!progress && loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const StepComponent = steps[displayIdx].component;
  const isLast = steps[currentIdx].key === 'complete';
  const progressPercent = ((currentIdx + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-white flex flex-col font-['Plus_Jakarta_Sans'] text-[#0A0A0A]">
      {/* Custom Minimal Navbar */}
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Campus<span className="text-[#F59E0B]">Connect</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/services" className="text-sm font-medium hover:text-[#F59E0B] transition-colors">
              Browse
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center w-full">
        <div className="w-full max-w-[640px] px-4 pt-16 pb-24 flex flex-col">
          {/* Progress indicators */}
          <div className="flex items-center justify-between relative mb-12">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#E5E7EB] z-0 overflow-hidden">
              {/* Animated connecting line fill */}
              <div
                className="h-full bg-[#F59E0B] transition-all duration-400 ease-in-out"
                style={{ width: `${(displayIdx / (steps.length - 1)) * 100}%` }}
              />
            </div>
            
            {steps.map((step, i) => {
              const isCompleted = i < displayIdx;
              const isActive = i === displayIdx;
              
              return (
                <div key={step.key} className="flex flex-col items-center relative z-10 bg-white px-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-400 ${
                      isCompleted ? 'bg-[#F59E0B] text-white bounce-scale' :
                      isActive ? 'bg-[#0A0A0A] text-white' :
                      'bg-[#FAFAFA] text-[#6B7280] border border-[#E5E7EB]'
                    }`}
                  >
                    {isCompleted ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs font-medium mt-2 whitespace-nowrap block text-center ${isActive ? 'text-[#0A0A0A]' : 'text-[#6B7280]'}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Step content */}
          <div
            className={`w-full ${
              isExiting
                ? direction === 'forward' ? 'step-exit-forward' : 'step-exit-backward'
                : direction === 'forward' ? 'step-enter-forward' : 'step-enter-backward'
            }`}
            key={displayIdx}
          >
            <StepComponent
              progress={progress}
              onNext={goNext}
              onBack={displayIdx > 0 ? goBack : null}
              user={user}
              refreshUser={refreshUser}
            />
          </div>
        </div>
      </div>

      {/* Custom Minimal Footer */}
      <footer className="py-6 mt-auto">
        <p className="text-center text-xs text-[#6B7280]">
          © {new Date().getFullYear()} CampusConnect. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
