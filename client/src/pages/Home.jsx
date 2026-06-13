import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { CATEGORIES } from '../data/categories';
import { getCategoryIcon } from '../lib/categoryIcons';

/* ==========================================================
   ScrollReveal — Intersection Observer driven reveal
   ========================================================== */
function ScrollReveal({ children, delay = 0, className = '', direction = 'up' }) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    const el = ref.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, []);

  const transforms = {
    up: 'translateY(32px)',
    left: 'translateX(-40px)',
    none: 'translateY(0)',
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translate(0,0)' : transforms[direction],
        transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ==========================================================
   Home (Landing Page)
   ========================================================== */
export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  /* ---- Hero animation stage ---- */
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 200),
      setTimeout(() => setStage(2), 400),
      setTimeout(() => setStage(3), 700),
      setTimeout(() => setStage(4), 1000),
      setTimeout(() => setStage(5), 1300),
      setTimeout(() => setStage(6), 1600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  /* ---- Steps data ---- */
  const steps = [
    {
      num: '01',
      title: 'Sign Up & Set Your Role',
      desc: 'Create your account in seconds. Choose to offer services, hire peers, or do both.',
    },
    {
      num: '02',
      title: 'Browse or List Services',
      desc: 'Seekers explore 18 categories. Providers list skills with custom pricing.',
    },
    {
      num: '03',
      title: 'Connect & Get It Done',
      desc: 'Message directly, book instantly, complete tasks, and leave verified reviews.',
    },
  ];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0A0A0A' }}>

      {/* ==================== INLINE KEYFRAMES ==================== */}
      <style>{`
        @keyframes cc-underline {
          from { width: 0; }
          to   { width: 100%; }
        }
        @keyframes cc-bounce-arrow {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(10px); }
        }
        @keyframes cc-fade-slide-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ==================== SECTION 2 — HERO ==================== */}
      <section
        style={{
          minHeight: 'calc(100vh - 4rem)',
          background: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          padding: '0 clamp(1.5rem, 5vw, 6rem)',
        }}
      >
        <div style={{ maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
          {/* "Campus" */}
          <h1
            style={{
              fontSize: 'clamp(60px, 12vw, 160px)',
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: '-0.03em',
              color: '#0A0A0A',
              margin: 0,
              opacity: stage >= 1 ? 1 : 0,
              transform: stage >= 1 ? 'translateY(0)' : 'translateY(28px)',
              transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
            }}
          >
            Campus
          </h1>

          {/* "Connect." */}
          <h1
            style={{
              fontSize: 'clamp(60px, 12vw, 160px)',
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: '-0.03em',
              color: '#F59E0B',
              margin: 0,
              marginTop: '0.05em',
              position: 'relative',
              display: 'inline-block',
              opacity: stage >= 2 ? 1 : 0,
              transform: stage >= 2 ? 'translateY(0)' : 'translateY(28px)',
              transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
            }}
          >
            Connect.
            {/* Amber underline */}
            <span
              style={{
                position: 'absolute',
                bottom: '-0.06em',
                left: 0,
                height: '4px',
                background: '#F59E0B',
                borderRadius: '2px',
                width: stage >= 3 ? '100%' : '0%',
                transition: 'width 0.6s ease-out',
              }}
            />
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: '#6B7280',
              marginTop: 'clamp(24px, 3vw, 40px)',
              maxWidth: '640px',
              lineHeight: 1.6,
              opacity: stage >= 4 ? 1 : 0,
              transform: stage >= 4 ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
            }}
          >
            The marketplace where university students buy, sell, and offer services — on campus.
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: 'clamp(24px, 3vw, 36px)',
              flexWrap: 'wrap',
              opacity: stage >= 5 ? 1 : 0,
              transform: stage >= 5 ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
            }}
          >
            <Link to="/services" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  background: '#F59E0B',
                  color: '#0A0A0A',
                  border: 'none',
                  padding: '16px 36px',
                  fontSize: '16px',
                  fontWeight: 700,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#D97706';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(245,158,11,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#F59E0B';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Find a Service
              </button>
            </Link>

            <Link to={user ? '/services/create' : '/register'} style={{ textDecoration: 'none' }}>
              <button
                style={{
                  background: 'transparent',
                  color: '#0A0A0A',
                  border: '2px solid #0A0A0A',
                  padding: '14px 34px',
                  fontSize: '16px',
                  fontWeight: 700,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 0.2s ease, transform 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#0A0A0A';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#0A0A0A';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Offer a Service
              </button>
            </Link>
          </div>
        </div>

        {/* Bounce arrow */}
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: stage >= 6 ? 1 : 0,
            transition: 'opacity 0.5s ease-out',
            animation: stage >= 6 ? 'cc-bounce-arrow 2s ease-in-out infinite' : 'none',
          }}
        >
          <ChevronDown style={{ width: '28px', height: '28px', color: '#F59E0B' }} />
        </div>
      </section>

      {/* ==================== SECTION 3 — WHAT WE ARE (Stats) ==================== */}
      <section style={{ background: '#FFFFFF', padding: 'clamp(60px, 8vw, 120px) clamp(1.5rem, 5vw, 6rem)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <ScrollReveal>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0',
              }}
            >
              {[
                { number: '18', label: 'Categories' },
                { number: '179', label: 'Services' },
                { number: '1', label: 'Campus' },
              ].map((stat, i) => (
                <div key={stat.label} style={{ display: 'flex', alignItems: 'center' }}>
                  {i > 0 && (
                    <div
                      style={{
                        width: '1px',
                        height: '64px',
                        background: '#E5E7EB',
                        margin: '0 clamp(24px, 4vw, 64px)',
                      }}
                    />
                  )}
                  <div style={{ textAlign: 'center', padding: '0 clamp(8px, 2vw, 16px)' }}>
                    <div
                      style={{
                        fontSize: 'clamp(48px, 8vw, 96px)',
                        fontWeight: 900,
                        color: '#F59E0B',
                        lineHeight: 1,
                        letterSpacing: '-0.03em',
                      }}
                    >
                      {stat.number}
                    </div>
                    <div
                      style={{
                        fontSize: 'clamp(14px, 1.5vw, 18px)',
                        color: '#6B7280',
                        fontWeight: 500,
                        marginTop: '8px',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div
              style={{
                textAlign: 'center',
                marginTop: 'clamp(48px, 6vw, 80px)',
                maxWidth: '700px',
                margin: 'clamp(48px, 6vw, 80px) auto 0',
              }}
            >
              <h2
                style={{
                  fontSize: 'clamp(24px, 3.5vw, 40px)',
                  fontWeight: 800,
                  color: '#0A0A0A',
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                }}
              >
                Every service a university student could ever need.
              </h2>
              <p
                style={{
                  fontSize: 'clamp(16px, 2vw, 20px)',
                  color: '#6B7280',
                  marginTop: '16px',
                  lineHeight: 1.5,
                }}
              >
                From tutoring to tailoring, food to fitness.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ==================== SECTION 4 — SERVICE CATEGORIES ==================== */}
      <section style={{ background: '#FAFAFA', padding: 'clamp(60px, 8vw, 120px) clamp(1.5rem, 5vw, 6rem)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ marginBottom: 'clamp(36px, 5vw, 56px)' }}>
              <h2
                style={{
                  fontSize: 'clamp(28px, 4vw, 48px)',
                  fontWeight: 800,
                  color: '#0A0A0A',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                What's on Campus.
              </h2>
              <div
                style={{
                  width: '64px',
                  height: '4px',
                  background: '#F59E0B',
                  borderRadius: '2px',
                  marginTop: '16px',
                }}
              />
            </div>
          </ScrollReveal>

          {/* Category grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '16px',
            }}
          >
            {CATEGORIES.map((cat, idx) => {
              const Icon = getCategoryIcon(cat.icon);
              return (
                <ScrollReveal key={cat.id} delay={Math.min(idx * 60, 600)}>
                  <button
                    onClick={() => navigate(`/services?category=${cat.id}`)}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '16px',
                      padding: 'clamp(20px, 3vw, 28px)',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#F59E0B';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(245,158,11,0.12)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Icon style={{ width: '28px', height: '28px', color: '#F59E0B' }} />
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#0A0A0A',
                        lineHeight: 1.3,
                      }}
                    >
                      {cat.name}
                    </span>
                  </button>
                </ScrollReveal>
              );
            })}
          </div>

          {/* Browse All button */}
          <ScrollReveal delay={200}>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'clamp(36px, 5vw, 56px)' }}>
              <Link to="/services" style={{ textDecoration: 'none' }}>
                <button
                  style={{
                    background: '#0A0A0A',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '16px 40px',
                    fontSize: '16px',
                    fontWeight: 700,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'background 0.2s ease, transform 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#1a1a1a';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#0A0A0A';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Browse All Services
                </button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ==================== SECTION 5 — HOW IT WORKS ==================== */}
      <section style={{ background: '#FFFFFF', padding: 'clamp(60px, 8vw, 120px) clamp(1.5rem, 5vw, 6rem)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <ScrollReveal>
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 48px)',
                fontWeight: 800,
                color: '#0A0A0A',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                marginBottom: 'clamp(36px, 5vw, 64px)',
              }}
            >
              Three steps.
            </h2>
          </ScrollReveal>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'clamp(24px, 3vw, 40px)',
            }}
          >
            {steps.map((step, idx) => (
              <ScrollReveal key={step.num} delay={idx * 180} direction="left">
                <div
                  style={{
                    borderLeft: '3px solid #F59E0B',
                    paddingLeft: 'clamp(20px, 3vw, 32px)',
                    position: 'relative',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                  }}
                >
                  {/* Background number */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '0',
                      fontSize: 'clamp(72px, 10vw, 120px)',
                      fontWeight: 900,
                      color: '#F3F4F6',
                      lineHeight: 1,
                      pointerEvents: 'none',
                      userSelect: 'none',
                      letterSpacing: '-0.05em',
                    }}
                  >
                    {step.num}
                  </span>

                  <h3
                    style={{
                      fontSize: 'clamp(18px, 2.5vw, 24px)',
                      fontWeight: 700,
                      color: '#0A0A0A',
                      marginBottom: '12px',
                      position: 'relative',
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 'clamp(14px, 1.5vw, 16px)',
                      color: '#6B7280',
                      lineHeight: 1.6,
                      position: 'relative',
                      maxWidth: '360px',
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== SECTION 6 — CALL TO ACTION ==================== */}
      <section
        style={{
          background: '#0A0A0A',
          padding: 'clamp(80px, 10vw, 140px) clamp(1.5rem, 5vw, 6rem)',
          textAlign: 'center',
        }}
      >
        <ScrollReveal>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Ready to get started?
          </h2>
          <p
            style={{
              fontSize: 'clamp(14px, 1.5vw, 18px)',
              color: '#9CA3AF',
              marginTop: '16px',
              lineHeight: 1.5,
            }}
          >
            Join hundreds of students already on CampusConnect.
          </p>
          <div style={{ marginTop: 'clamp(28px, 4vw, 40px)' }}>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  background: '#F59E0B',
                  color: '#0A0A0A',
                  border: 'none',
                  padding: '18px 48px',
                  fontSize: '18px',
                  fontWeight: 700,
                  borderRadius: '14px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#D97706';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(245,158,11,0.35)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#F59E0B';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Sign Up Free
              </button>
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* ==================== SECTION 7 — FOOTER ==================== */}
      <footer
        style={{
          background: '#FFFFFF',
          borderTop: '1px solid #E5E7EB',
          padding: 'clamp(32px, 5vw, 48px) clamp(1.5rem, 5vw, 6rem)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            alignItems: 'center',
          }}
        >
          {/* Top row: Logo + Links */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              flexWrap: 'wrap',
              gap: '20px',
            }}
          >
            {/* Logo */}
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#0A0A0A' }}>
                Campus
              </span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#F59E0B' }}>
                Connect
              </span>
            </Link>

            {/* Links */}
            <nav style={{ display: 'flex', gap: 'clamp(16px, 3vw, 32px)', flexWrap: 'wrap' }}>
              {[
                { label: 'Browse', to: '/services' },
                { label: 'Dashboard', to: '/dashboard' },
                { label: 'Login', to: '/login' },
                { label: 'Sign Up', to: '/register' },
              ].map(link => (
                <Link
                  key={link.label}
                  to={link.to}
                  style={{
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#6B7280',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#0A0A0A'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#6B7280'; }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Copyright */}
          <p style={{ fontSize: '13px', color: '#9CA3AF', textAlign: 'center' }}>
            © {new Date().getFullYear()} CampusConnect. Built for students, by students.
          </p>
        </div>
      </footer>
    </div>
  );
}
