import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { CATEGORIES } from '../../data/categories';
import { getCategoryIcon } from '../../lib/categoryIcons';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

function ArrowRightIcon() {
  return <ArrowRight size={16} />;
}

export default function StepInterests({ onNext, onBack, setStepProgress }) {
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (setStepProgress) {
      setStepProgress({ current: 0, total: 1, title: 'Your Interests' });
    }
  }, [setStepProgress]);

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    setError('');
  };

  const handleSubmit = async () => {
    if (selected.length === 0) {
      setError('Please select at least one interest');
      return;
    }
    setLoading(true);
    try {
      await api.put('/onboarding/interests', { interests: selected });
      onNext();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col animate-typeform-enter">
      {/* Question number */}
      <div
        style={{
          fontSize: '0.8125rem',
          fontWeight: 700,
          color: '#6B7280',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        01 <ArrowRight size={14} style={{ display: 'inline' }} />
      </div>

      {/* Title */}
      <h2
        style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#0A0A0A',
          lineHeight: 1.25,
          marginBottom: '8px',
        }}
      >
        What kind of services are you looking for?
      </h2>
      <p style={{ fontSize: '1rem', color: '#6B7280', marginBottom: '28px' }}>
        Select all that apply — minimum 1
      </p>

      {error && (
        <p style={{ color: '#EF4444', fontSize: '0.875rem', marginBottom: '12px' }}>{error}</p>
      )}

      {/* Category grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '32px',
        }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = selected.includes(cat.id);
          const Icon = getCategoryIcon(cat.icon);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggle(cat.id)}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '16px 8px',
                height: '110px',
                borderRadius: '12px',
                border: isActive ? '2px solid #F59E0B' : '1.5px solid #E5E7EB',
                background: '#fff',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s',
                transform: 'translateY(0)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = '#0A0A0A';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#F59E0B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check size={11} color="#fff" strokeWidth={3} />
                </div>
              )}
              <Icon size={22} style={{ color: cat.color }} />
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#0A0A0A',
                  lineHeight: 1.3,
                }}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Continue button — appears once at least 1 selected */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {selected.length > 0 && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              height: '44px',
              width: '140px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.9375rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              background: '#F59E0B',
              color: '#0A0A0A',
              opacity: loading ? 0.5 : 1,
              transition: 'background 0.2s, opacity 0.2s',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#d97706'; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#F59E0B'; }}
          >
            {loading ? '…' : 'Continue'} {!loading && <ArrowRight size={16} />}
          </button>
        )}

        {/* Back */}
        {onBack && (
          <button
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#6B7280',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              marginTop: '4px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#0A0A0A')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
          >
            <ArrowLeft size={14} /> Back
          </button>
        )}
      </div>
    </div>
  );
}
