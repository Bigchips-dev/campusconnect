import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, Check } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /* ---- Hide global navbar & footer ---- */
  useEffect(() => {
    const globalHeader = document.querySelector('header');
    const mainEl = document.querySelector('main');
    const globalFooter = mainEl?.parentElement?.querySelector(':scope > footer');

    if (globalHeader) globalHeader.style.display = 'none';
    if (mainEl) mainEl.style.paddingTop = '0';
    if (globalFooter) globalFooter.style.display = 'none';

    return () => {
      if (globalHeader) globalHeader.style.display = '';
      if (mainEl) mainEl.style.paddingTop = '';
      if (globalFooter) globalFooter.style.display = '';
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(form.email, form.password, rememberMe);
      navigate(result.user.onboardingComplete ? from : '/onboarding', { replace: true });
    } catch (err) {
      console.error('Login API error:', err);
      setError(err.response?.data?.message || err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  /* ---- Shared input style builder ---- */
  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '14px 16px',
    fontSize: '15px',
    fontFamily: 'inherit',
    color: '#0A0A0A',
    background: '#FFFFFF',
    border: `1.5px solid ${hasError ? '#EF4444' : '#E5E7EB'}`,
    borderRadius: '12px',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  });

  const handleFocus = (e) => {
    e.target.style.borderColor = '#0A0A0A';
    e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.15)';
  };
  const handleBlur = (e) => {
    e.target.style.borderColor = '#E5E7EB';
    e.target.style.boxShadow = 'none';
  };

  const bullets = [
    '18 service categories',
    'Direct messaging with providers',
    'Book services in seconds',
  ];

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        display: 'flex',
        minHeight: '100vh',
        background: '#FFFFFF',
      }}
    >
      {/* ==================== INLINE ANIMATIONS ==================== */}
      <style>{`
        @keyframes cc-slide-left {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes cc-slide-right {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* ==================== LEFT COLUMN — BRANDING ==================== */}
      <div
        style={{
          width: '50%',
          background: '#0A0A0A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(40px, 5vw, 80px)',
          animation: 'cc-slide-left 0.4s ease-out forwards',
        }}
        className="hidden lg:flex"
      >
        <div style={{ maxWidth: '440px' }}>
          {/* Logo text */}
          <h1 style={{ fontSize: 'clamp(40px, 5vw, 56px)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.03em', margin: 0 }}>
            <span style={{ color: '#FFFFFF' }}>Campus</span>
            <br />
            <span style={{ color: '#F59E0B' }}>Connect.</span>
          </h1>

          {/* Tagline */}
          <p style={{ color: '#9CA3AF', fontSize: '16px', lineHeight: 1.6, marginTop: '24px', maxWidth: '360px' }}>
            The marketplace where university students buy, sell, and offer services — on campus.
          </p>

          {/* Bullet points */}
          <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bullets.map((text) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(245,158,11,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Check style={{ width: '14px', height: '14px', color: '#F59E0B' }} />
                </div>
                <span style={{ color: '#9CA3AF', fontSize: '15px' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ==================== RIGHT COLUMN — FORM ==================== */}
      <div
        style={{
          width: '100%',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(32px, 5vw, 64px)',
          animation: 'cc-slide-right 0.4s ease-out forwards',
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', marginBottom: '40px' }}>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#0A0A0A' }}>Campus</span>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#F59E0B' }}>Connect</span>
          </Link>

          {/* Heading */}
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.02em', margin: 0 }}>
            Welcome back.
          </h2>
          <p style={{ color: '#6B7280', fontSize: '15px', marginTop: '8px', marginBottom: '32px' }}>
            Sign in to your account
          </p>

          {/* Error */}
          {error && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                fontSize: '14px',
                marginBottom: '24px',
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0A0A0A', marginBottom: '8px' }}>
                Email
              </label>
              <input
                type="email"
                placeholder="you@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                style={inputStyle(false)}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0A0A0A', marginBottom: '8px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ ...inputStyle(false), paddingRight: '48px' }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    color: '#9CA3AF',
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#F59E0B',
                    cursor: 'pointer',
                  }}
                />
                <span style={{ fontSize: '14px', color: '#6B7280' }}>Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#F59E0B',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#D97706'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#F59E0B'; }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: 700,
                fontFamily: 'inherit',
                color: '#FFFFFF',
                background: '#0A0A0A',
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'background 0.2s ease, transform 0.2s ease',
              }}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#0A0A0A'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '28px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
            <span style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
          </div>

          {/* Sign up link */}
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#6B7280', margin: 0 }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: '#F59E0B',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#D97706'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#F59E0B'; }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
