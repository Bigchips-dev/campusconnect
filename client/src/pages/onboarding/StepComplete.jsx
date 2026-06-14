import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { CheckCircle2, Check, ArrowRight } from 'lucide-react';

export default function StepComplete({ user, refreshUser, setStepProgress }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (setStepProgress) {
      setStepProgress({ current: 1, total: 1, title: 'All Set!' });
    }
  }, [setStepProgress]);

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
    { text: 'Profile information completed' },
    ...(isSeeker ? [{ text: 'Service interests selected' }] : []),
    ...(isProvider ? [{ text: 'Service skills configured' }] : []),
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        width: '100%',
        maxWidth: '560px',
        margin: '0 auto',
        padding: '40px 24px 64px',
      }}
    >
      {/* Amber check circle */}
      <div
        className="big-bounce-scale"
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#F59E0B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '28px',
          boxShadow: '0 8px 32px rgba(245,158,11,0.35)',
        }}
      >
        <Check size={40} color="#fff" strokeWidth={3} />
      </div>

      {/* Heading */}
      <h2
        style={{
          fontSize: '2rem',
          fontWeight: 800,
          color: '#0A0A0A',
          lineHeight: 1.2,
          marginBottom: '10px',
          letterSpacing: '-0.02em',
        }}
      >
        You're all set, {user?.firstName || ''}!
      </h2>

      {/* Subheading */}
      <p
        style={{
          fontSize: '1rem',
          color: '#6B7280',
          marginBottom: '36px',
          lineHeight: 1.5,
        }}
      >
        Your profile is ready. Here's what you can do next:
      </p>

      {/* Checklist */}
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          marginBottom: '40px',
        }}
      >
        {checklist.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              background: '#fff',
              padding: '14px 18px',
              borderRadius: '12px',
              border: '1.5px solid #E5E7EB',
              textAlign: 'left',
            }}
          >
            <CheckCircle2
              size={20}
              color="#F59E0B"
              style={{ flexShrink: 0 }}
            />
            <span
              style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#0A0A0A' }}
            >
              {item.text}
            </span>
          </div>
        ))}
      </div>

      {/* CTA Buttons */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          width: '100%',
        }}
      >
        <button
          onClick={() => handleFinish('/dashboard')}
          disabled={loading}
          style={{
            width: '280px',
            height: '52px',
            background: '#0A0A0A',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1rem',
            borderRadius: '10px',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
            transition: 'background 0.2s, color 0.2s',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background = '#F59E0B';
              e.currentTarget.style.color = '#0A0A0A';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.background = '#0A0A0A';
              e.currentTarget.style.color = '#fff';
            }
          }}
        >
          Go to Dashboard
          <ArrowRight size={16} />
        </button>

        <button
          onClick={() => handleFinish('/services')}
          disabled={loading}
          style={{
            width: '280px',
            height: '52px',
            background: '#fff',
            color: '#0A0A0A',
            fontWeight: 700,
            fontSize: '1rem',
            borderRadius: '10px',
            border: '2px solid #0A0A0A',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
            transition: 'background 0.2s',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#FAFAFA'; }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#fff'; }}
        >
          Explore Services
        </button>
      </div>
    </div>
  );
}
