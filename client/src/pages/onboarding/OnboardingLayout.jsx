import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import StepProfile from './StepProfile';
import StepInterests from './StepInterests';
import StepServices from './StepServices';
import StepComplete from './StepComplete';
import { Loader2, Check } from 'lucide-react';

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
    { key: 'complete', title: 'All Set', component: StepComplete },
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

  // Compute Sidebar Steps
  const getSidebarSteps = () => {
    if (isSeeker && isProvider) {
      return ['About You', 'Your Interests', 'Your Services', 'Service Details', 'All Set'];
    } else if (isProvider) {
      return ['About You', 'Your Services', 'Service Details', 'All Set'];
    } else {
      return ['About You', 'Your Interests', 'All Set'];
    }
  };

  const getActiveTitle = () => {
    const key = steps[displayIdx]?.key;
    if (key === 'profile') return 'About You';
    if (key === 'interests') return 'Your Interests';
    if (key === 'services') return stepProgress.current === 0 ? 'Your Services' : 'Service Details';
    if (key === 'complete') return 'All Set';
    return '';
  };

  const sidebarSteps = getSidebarSteps();
  const activeTitle = getActiveTitle();
  const activeIndex = sidebarSteps.indexOf(activeTitle);

  // Calculate overall percentage
  let overallPercent = 0;
  if (isLast) {
    overallPercent = 100;
  } else if (activeIndex >= 0) {
    const stepWeight = 100 / sidebarSteps.length;
    const basePercent = activeIndex * stepWeight;
    const stepFraction = stepProgress.current / Math.max(stepProgress.total, 1);
    overallPercent = Math.round(basePercent + (stepFraction * stepWeight));
  }

  return (
    <div
      className="min-h-screen flex overflow-hidden w-full"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: '#0A0A0A', background: '#FFFFFF' }}
    >
      {/* Mobile: Thin amber progress bar at top */}
      {!isLast && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#E5E7EB] md:hidden z-50">
          <div
            className="h-full bg-[#F59E0B] transition-all duration-500"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      )}

      {/* LEFT PANEL — Question Content */}
      <div
        className="flex flex-col relative overflow-y-auto w-full md:w-[calc(100%-220px)]"
        style={{ background: '#FFFFFF', minHeight: '100vh' }}
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

      {/* RIGHT PANEL — Fixed Step Sidebar */}
      <div
        className="hidden md:flex flex-col border-l border-[#E5E7EB]"
        style={{
          width: '220px',
          position: 'fixed',
          right: 0,
          top: 0,
          height: '100vh',
          background: '#F9F9F9',
          padding: '40px 20px',
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontSize: '10px',
            fontWeight: 600,
            color: '#9CA3AF',
            letterSpacing: '0.1em',
            marginBottom: '20px',
          }}
        >
          STEPS
        </p>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {sidebarSteps.map((step, index) => {
            const isCompleted = index < activeIndex || isLast;
            const isActive = index === activeIndex && !isLast;

            let bg = 'transparent';
            let color = '#9CA3AF'; // UPCOMING
            let weight = 400;

            if (isCompleted) {
              color = '#6B7280';
            } else if (isActive) {
              bg = '#0A0A0A';
              color = '#FFFFFF';
              weight = 600;
            }

            return (
              <div
                key={step}
                style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  marginBottom: '6px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: bg,
                  color: color,
                  fontWeight: weight,
                  transition: 'all 0.3s ease',
                }}
              >
                {isCompleted && (
                  <Check size={14} style={{ color: '#F59E0B', flexShrink: 0 }} />
                )}
                <span>{step}</span>
              </div>
            );
          })}
        </div>

        {/* BOTTOM: Progress Bar */}
        <div style={{ marginTop: 'auto' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#F59E0B' }}>
            {overallPercent}% complete
          </p>
          <div style={{ width: '100%', height: '4px', background: '#E5E7EB', borderRadius: '999px', marginTop: '6px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                background: '#F59E0B',
                width: `${overallPercent}%`,
                transition: 'width 0.5s ease',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
