import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, Check, Search, Briefcase } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '', roles: ['SEEKER'],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

  const toggleRole = (role) => {
    setForm((prev) => {
      const has = prev.roles.includes(role);
      let roles;
      if (has) {
        roles = prev.roles.filter((r) => r !== role);
        if (roles.length === 0) roles = [role === 'SEEKER' ? 'PROVIDER' : 'SEEKER'];
      } else {
        roles = [...prev.roles, role];
      }
      return { ...prev, roles };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    const names = form.fullName.trim().split(/\s+/);
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || firstName;

    if (!firstName) {
      setError('Please enter your full name');
      return;
    }

    setLoading(true);
    try {
      const payload = { firstName, lastName, email: form.email, password: form.password, roles: form.roles };
      console.log('Sending registration payload to backend:', payload);
      await register(payload);
      navigate('/onboarding', { replace: true });
    } catch (err) {
      console.error('Registration API error:', err);
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || err.message || 'Registration failed');
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
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', marginBottom: '36px' }}>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#0A0A0A' }}>Campus</span>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#F59E0B' }}>Connect</span>
          </Link>

          {/* Heading */}
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.02em', margin: 0 }}>
            Create your account.
          </h2>
          <p style={{ color: '#6B7280', fontSize: '15px', marginTop: '8px', marginBottom: '28px' }}>
            Join CampusConnect today
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
                marginBottom: '20px',
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Full Name */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0A0A0A', marginBottom: '8px' }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
                style={inputStyle(false)}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

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
                  placeholder="Min 8 characters"
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

            {/* Confirm Password */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0A0A0A', marginBottom: '8px' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  style={{ ...inputStyle(false), paddingRight: '48px' }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
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
                  {showConfirm ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#0A0A0A', marginBottom: '12px' }}>
                I want to...
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Find Services */}
                <button
                  type="button"
                  onClick={() => toggleRole('SEEKER')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '20px 16px',
                    borderRadius: '14px',
                    border: `2px solid ${form.roles.includes('SEEKER') ? '#F59E0B' : '#E5E7EB'}`,
                    background: form.roles.includes('SEEKER') ? 'rgba(245,158,11,0.04)' : '#FFFFFF',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s ease, background 0.2s ease, transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => { if (!form.roles.includes('SEEKER')) e.currentTarget.style.borderColor = '#D1D5DB'; }}
                  onMouseLeave={(e) => { if (!form.roles.includes('SEEKER')) e.currentTarget.style.borderColor = '#E5E7EB'; }}
                >
                  <Search
                    style={{
                      width: '24px',
                      height: '24px',
                      color: form.roles.includes('SEEKER') ? '#F59E0B' : '#9CA3AF',
                      transition: 'color 0.2s ease',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: form.roles.includes('SEEKER') ? '#0A0A0A' : '#6B7280',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    Find Services
                  </span>
                </button>

                {/* Offer Services */}
                <button
                  type="button"
                  onClick={() => toggleRole('PROVIDER')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '20px 16px',
                    borderRadius: '14px',
                    border: `2px solid ${form.roles.includes('PROVIDER') ? '#F59E0B' : '#E5E7EB'}`,
                    background: form.roles.includes('PROVIDER') ? 'rgba(245,158,11,0.04)' : '#FFFFFF',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s ease, background 0.2s ease, transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => { if (!form.roles.includes('PROVIDER')) e.currentTarget.style.borderColor = '#D1D5DB'; }}
                  onMouseLeave={(e) => { if (!form.roles.includes('PROVIDER')) e.currentTarget.style.borderColor = '#E5E7EB'; }}
                >
                  <Briefcase
                    style={{
                      width: '24px',
                      height: '24px',
                      color: form.roles.includes('PROVIDER') ? '#F59E0B' : '#9CA3AF',
                      transition: 'color 0.2s ease',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: form.roles.includes('PROVIDER') ? '#0A0A0A' : '#6B7280',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    Offer Services
                  </span>
                </button>
              </div>
              <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '8px' }}>You can select both</p>
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
                marginTop: '4px',
              }}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#0A0A0A'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Sign in link */}
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#6B7280', margin: '24px 0 0' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: '#F59E0B',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#D97706'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#F59E0B'; }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
