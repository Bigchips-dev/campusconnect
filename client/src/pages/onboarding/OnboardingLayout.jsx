import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
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
          } else if (dbStep >= 3) {
            setCurrentIdx(steps.length - 1); // complete
          } else if (dbStep >= 2) {
            // After interests, find services or complete
            const servicesIdx = stepKeys.indexOf('services');
            setCurrentIdx(servicesIdx >= 0 ? servicesIdx : steps.length - 1);
          } else if (dbStep >= 1) {
            // After profile, find interests or services or complete
            setCurrentIdx(1);
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

  const goNext = () => {
    if (currentIdx < steps.length - 1) setCurrentIdx(currentIdx + 1);
  };

  const goBack = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const StepComponent = steps[currentIdx].component;
  const isLast = steps[currentIdx].key === 'complete';
  const progressPercent = ((currentIdx + 1) / steps.length) * 100;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-primary-500">Step {currentIdx + 1} of {steps.length}</p>
              <h2 className="heading-xl">{steps[currentIdx].title}</h2>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-muted)' }}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mt-3">
            {steps.map((step, i) => (
              <div key={step.key} className="flex items-center gap-2">
                <div
                  className={[
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                    i < currentIdx ? 'bg-primary-500 text-white' :
                    i === currentIdx ? 'bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-300 ring-2 ring-primary-500' :
                    'text-[var(--text-faint)]',
                  ].join(' ')}
                  style={i > currentIdx ? { backgroundColor: 'var(--bg-muted)' } : undefined}
                >
                  {i < currentIdx ? '✓' : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: i < currentIdx ? 'var(--color-primary-500)' : 'var(--bg-muted)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 animate-fade-in" key={currentIdx}>
        <StepComponent
          progress={progress}
          onNext={goNext}
          onBack={currentIdx > 0 ? goBack : null}
          user={user}
          refreshUser={refreshUser}
        />
      </div>
    </div>
  );
}
