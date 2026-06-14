import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import StepProfile from './StepProfile';
import StepInterests from './StepInterests';
import StepServices from './StepServices';
import StepComplete from './StepComplete';
import { Loader2 } from 'lucide-react';

export default function OnboardingLayout() {
  const { user, isOnboarded, refreshUser } = useAuth();
  const [displayIdx, setDisplayIdx] = useState(0);
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
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#F59E0B]" />
      </div>
    );
  }

  const StepComponent = steps[displayIdx].component;
  const isLast = steps[displayIdx].key === 'complete';
  const progressPercent = Math.round((stepProgress.current / Math.max(stepProgress.total, 1)) * 100);

  return (
    <div
      className="min-h-screen h-screen flex overflow-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: '#0A0A0A', background: '#FFFFFF' }}
    >
      {/* Mobile: Thin amber progress bar at top */}
      {!isLast && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#E5E7EB] md:hidden z-50">
          <div
            className="h-full bg-[#F59E0B] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* LEFT PANEL — 80% */}
      <div
        className={`flex flex-col relative overflow-y-auto ${isLast ? 'w-full' : 'flex-1'}`}
        style={{ background: '#FFFFFF' }}
      >
        {/* Logo — top left */}
        <div className="absolute top-6 left-6 z-10">
          <Link
            to="/"
            style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0A0A0A', textDecoration: 'none' }}
          >
            Campus<span style={{ color: '#F59E0B' }}>Connect</span>
          </Link>
        </div>

        {/* Content — centred */}
        <div
          className={`flex-1 flex items-center justify-center w-full min-h-full ${isLast ? 'pt-20' : 'pt-16'}`}
        >
          <div
            className="w-full px-6 py-12"
            style={{ maxWidth: isLast ? '640px' : '560px' }}
          >
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

      {/* RIGHT PANEL — 20%, hidden on mobile & on last step */}
      {!isLast && (
        <div
          className="hidden md:flex flex-col justify-between p-8 border-l border-[#E5E7EB]"
          style={{
            width: '20%',
            minWidth: '200px',
            maxWidth: '280px',
            background: '#FAFAFA',
          }}
        >
          {/* Step name */}
          <div>
            <p
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#6B7280',
                marginBottom: '28px',
              }}
            >
              {stepProgress.title || steps[displayIdx].title}
            </p>

            {/* Vertical dots */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Array.from({ length: stepProgress.total }).map((_, idx) => {
                const isAnswered = idx < stepProgress.current;
                const isCurrent = idx === stepProgress.current;
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: isAnswered ? '#F59E0B' : isCurrent ? '#0A0A0A' : '#E5E7EB',
                        transition: 'background 0.3s ease',
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        height: '2px',
                        flex: 1,
                        borderRadius: '2px',
                        background: isAnswered ? '#F59E0B' : '#E5E7EB',
                        transition: 'background 0.3s ease',
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Percent at bottom */}
          <p
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: '#F59E0B',
            }}
          >
            {progressPercent}% complete
          </p>
        </div>
      )}
    </div>
  );
}
