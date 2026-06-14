import { useState, useEffect, useRef } from 'react';
import api from '../../lib/api';
import SearchableSelect from '../../components/ui/SearchableSelect';
import { FACULTIES, LEVELS, GENDERS } from '../../data/categories';
import { Camera, ArrowRight, ArrowLeft } from 'lucide-react';

// ─── Shared input / button styles ───────────────────────────────────────────
const INPUT_CLS =
  'w-full h-[52px] px-[16px] py-[14px] text-[1rem] bg-white border border-[#E5E7EB] rounded-[8px] outline-none transition-all duration-200';
const INPUT_FOCUS_STYLE = {
  borderColor: '#0A0A0A',
  boxShadow: '0 0 0 3px rgba(245,158,11,0.15)',
};

function OKButton({ onClick, disabled, isLast, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        height: '44px',
        width: isLast ? '140px' : '120px',
        borderRadius: '8px',
        fontWeight: 700,
        fontSize: '0.9375rem',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: isLast ? '#F59E0B' : '#0A0A0A',
        color: isLast ? '#0A0A0A' : '#fff',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.2s, color 0.2s, opacity 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = isLast ? '#d97706' : '#F59E0B';
          e.currentTarget.style.color = '#0A0A0A';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = isLast ? '#F59E0B' : '#0A0A0A';
          e.currentTarget.style.color = isLast ? '#0A0A0A' : '#fff';
        }
      }}
    >
      {loading ? '…' : isLast ? 'Continue' : 'OK'}
      {!loading && <ArrowRight size={16} />}
    </button>
  );
}

function BackLink({ onClick }) {
  return (
    <button
      onClick={onClick}
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
        transition: 'color 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = '#0A0A0A')}
      onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
    >
      <ArrowLeft size={14} /> Back
    </button>
  );
}

function SkipLink({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#6B7280',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        transition: 'color 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = '#0A0A0A')}
      onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
    >
      Skip for now
    </button>
  );
}

// ─── Animated question wrapper ───────────────────────────────────────────────
function QuestionSlide({ children, direction }) {
  const [cls, setCls] = useState(
    direction === 'back' ? 'animate-typeform-enter-down' : 'animate-typeform-enter'
  );

  useEffect(() => {
    setCls(direction === 'back' ? 'animate-typeform-enter-down' : 'animate-typeform-enter');
  }, [direction, children]);

  return <div className={`w-full flex flex-col ${cls}`}>{children}</div>;
}

// ─── Question number badge ───────────────────────────────────────────────────
function QNum({ n }) {
  return (
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
      {String(n).padStart(2, '0')} <ArrowRight size={14} style={{ display: 'inline' }} />
    </div>
  );
}

// ─── Question heading ────────────────────────────────────────────────────────
function QTitle({ children, subtitle }) {
  return (
    <>
      <h2
        style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#0A0A0A',
          lineHeight: 1.25,
          marginBottom: subtitle ? '8px' : '24px',
        }}
      >
        {children}
      </h2>
      {subtitle && (
        <p style={{ fontSize: '1rem', color: '#6B7280', marginBottom: '24px' }}>{subtitle}</p>
      )}
    </>
  );
}

// ─── Focus-managed text input ─────────────────────────────────────────────────
function TFInput({ value, onChange, onSubmit, placeholder, readOnly, type = 'text' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!readOnly && ref.current) ref.current.focus();
  }, [readOnly]);

  return (
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      value={value}
      readOnly={readOnly}
      onChange={onChange}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onSubmit?.(); } }}
      className={INPUT_CLS}
      style={readOnly ? { background: '#F9FAFB' } : {}}
      onFocus={(e) => Object.assign(e.target.style, INPUT_FOCUS_STYLE)}
      onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
    />
  );
}

// ─── Pill button (gender / level) ─────────────────────────────────────────────
function PillBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 22px',
        borderRadius: '9999px',
        border: active ? '2px solid #0A0A0A' : '1.5px solid #E5E7EB',
        background: active ? '#0A0A0A' : '#fff',
        color: active ? '#fff' : '#0A0A0A',
        fontWeight: 600,
        fontSize: '0.9375rem',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.borderColor = '#0A0A0A'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.borderColor = '#E5E7EB'; }}
    >
      {label}
    </button>
  );
}

export default function StepProfile({ onNext, onBack, user, setStepProgress }) {
  const [form, setForm] = useState({
    phone: '',
    gender: '',
    faculty: '',
    level: '',
    bio: '',
    avatarUrl: '',
  });

  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [direction, setDirection] = useState('forward');
  const [slideKey, setSlideKey] = useState(0);

  const totalQuestions = 7;

  useEffect(() => {
    if (setStepProgress) {
      setStepProgress({ current: currentQIdx, total: totalQuestions, title: 'About You' });
    }
  }, [currentQIdx, setStepProgress]);

  const isOptional = currentQIdx === 5 || currentQIdx === 6;
  const isLastQ = currentQIdx === totalQuestions - 1;

  const validate = () => {
    if (currentQIdx === 1 && !form.phone.trim()) return 'Please enter your phone number';
    if (currentQIdx === 2 && !form.gender) return 'Please select your gender';
    if (currentQIdx === 3 && !form.faculty) return 'Please select your faculty';
    if (currentQIdx === 4 && !form.level) return 'Please select your level';
    return null;
  };

  const advance = (skip = false) => {
    if (!skip) {
      const err = validate();
      if (err) { setError(err); return; }
    }
    setError('');
    if (isLastQ) {
      handleSubmit();
    } else {
      setDirection('forward');
      setSlideKey((k) => k + 1);
      setCurrentQIdx((i) => i + 1);
    }
  };

  const retreat = () => {
    setError('');
    if (currentQIdx > 0) {
      setDirection('back');
      setSlideKey((k) => k + 1);
      setCurrentQIdx((i) => i - 1);
    } else {
      onBack?.();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.put('/onboarding/profile', form);
      onNext();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
      setLoading(false);
    }
  };

  // Handle pill selections
  const handleGenderClick = (value) => {
    setForm((f) => ({ ...f, gender: value }));
    if (value) setError('');
  };

  const handleLevelClick = (value) => {
    setForm((f) => ({ ...f, level: value }));
    if (value) setError('');
  };

  const renderInput = () => {
    switch (currentQIdx) {
      case 0:
        return (
          <TFInput
            value={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
            readOnly
          />
        );
      case 1:
        return (
          <TFInput
            value={form.phone}
            onChange={(e) => { setForm((f) => ({ ...f, phone: e.target.value })); setError(''); }}
            onSubmit={advance}
            placeholder="e.g. 08012345678"
            type="text"
          />
        );
      case 2:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(GENDERS || [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' }]).map((g) => (
              <button
                key={g.value}
                onClick={() => handleGenderClick(g.value)}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  textAlign: 'left',
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: '10px',
                  border: form.gender === g.value ? '2px solid #0A0A0A' : '1.5px solid #E5E7EB',
                  background: form.gender === g.value ? '#0A0A0A' : '#fff',
                  color: form.gender === g.value ? '#fff' : '#0A0A0A',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {g.label}
              </button>
            ))}
          </div>
        );
      case 3:
        return (
          <SearchableSelect
            options={FACULTIES}
            value={form.faculty}
            onChange={(val) => { setForm((f) => ({ ...f, faculty: val })); setError(''); }}
            placeholder="Search your faculty…"
          />
        );
      case 4:
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {(LEVELS || ['100L', '200L', '300L', '400L', '500L', 'Postgraduate', 'Staff']).map((lvl) => (
              <PillBtn
                key={lvl}
                label={lvl}
                active={form.level === lvl}
                onClick={() => handleLevelClick(lvl)}
              />
            ))}
          </div>
        );
      case 5:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Avatar preview */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {form.avatarUrl ? (
                <img
                  src={form.avatarUrl}
                  alt="Profile preview"
                  style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #E5E7EB' }}
                />
              ) : (
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    background: '#FAFAFA',
                    border: '1.5px solid #E5E7EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Camera size={32} color="#D1D5DB" />
                </div>
              )}
            </div>
            <TFInput
              value={form.avatarUrl}
              onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
              onSubmit={advance}
              placeholder="https://example.com/photo.jpg"
            />
          </div>
        );
      case 6:
        return (
          <textarea
            autoFocus
            rows={4}
            placeholder="Tell us a bit about yourself…"
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '14px 16px',
              fontSize: '1rem',
              background: '#fff',
              border: '1.5px solid #E5E7EB',
              borderRadius: '8px',
              outline: 'none',
              resize: 'none',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={(e) => Object.assign(e.target.style, INPUT_FOCUS_STYLE)}
            onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
          />
        );
      default:
        return null;
    }
  };

  const questions = [
    "What's your name?",
    "What's your phone number?",
    "What's your gender?",
    "Which faculty are you in?",
    "What level are you?",
    "Add a profile photo (optional)",
    "Tell us about yourself (optional)",
  ];
  const subtitles = [
    "Confirm the name you signed up with.",
    null, null, null, null, null, null,
  ];

  return (
    <QuestionSlide key={slideKey} direction={direction}>
      <QNum n={currentQIdx + 1} />
      <QTitle subtitle={subtitles[currentQIdx]}>{questions[currentQIdx]}</QTitle>

      {error && (
        <p style={{ color: '#EF4444', fontSize: '0.875rem', marginBottom: '12px' }}>{error}</p>
      )}

      <div style={{ width: '100%', marginBottom: '28px' }}>{renderInput()}</div>

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <OKButton
          onClick={() => advance()}
          disabled={loading}
          isLast={isLastQ}
          loading={loading}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '4px' }}>
          {/* Back link */}
          {(currentQIdx > 0 || onBack) && <BackLink onClick={retreat} />}
          {/* Skip link for optional questions */}
          {isOptional && <SkipLink onClick={() => advance(true)} />}
        </div>
      </div>
    </QuestionSlide>
  );
}
