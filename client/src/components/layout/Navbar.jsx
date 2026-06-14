import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  User,
  LayoutDashboard,
  BookOpen,
  CalendarCheck,
  PlusCircle,
  Search,
  Sparkles,
  Bell,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';

const T = {
  text: '#0A0A0A',
  accent: '#F59E0B',
  muted: '#6B7280',
  border: '#E5E7EB',
  bg: '#ffffff',
  lightBg: '#FAFAFA',
};

const navLinks = [
  { to: '/services', label: 'Browse', icon: Search },
  { to: '/services/create', label: 'Post a Service', icon: PlusCircle, auth: true },
];

export default function Navbar() {
  const { user, logout, unreadCount } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 backdrop-blur-lg border-b"
      style={{
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderColor: T.border,
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: T.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={16} style={{ color: '#fff' }} />
            </div>
            <span className="hidden sm:block" style={{ fontSize: '1.125rem', fontWeight: 800, color: T.text }}>
              Campus<span style={{ color: T.accent }}>Connect</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks
              .filter((l) => !l.auth || user)
              .map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className="text-sm font-medium px-3 py-2 rounded-lg transition-colors duration-200"
                  style={({ isActive }) => ({
                    color: isActive ? T.accent : T.text,
                    background: isActive ? T.lightBg : 'transparent',
                  })}
                  onMouseEnter={(e) => { if (!e.currentTarget.classList.contains('active')) e.currentTarget.style.color = T.accent; }}
                  onMouseLeave={(e) => {
                    const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
                    if (!isActive) e.currentTarget.style.color = T.text;
                  }}
                >
                  {link.label}
                </NavLink>
              ))}
          </nav>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              style={{
                padding: 8, borderRadius: 8, border: 'none', background: 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background .15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = T.lightBg; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun size={20} style={{ color: T.accent }} />
              ) : (
                <Moon size={20} style={{ color: T.muted }} />
              )}
            </button>

            {user && (
              <Link
                to="/messages"
                style={{
                  position: 'relative', padding: 8, borderRadius: 8, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
                  transition: 'background .15s, color .15s', color: T.text,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = T.lightBg; e.currentTarget.style.color = T.accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.text; }}
                aria-label="Messages"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 2, right: 2, minWidth: 18, height: 18,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 9999, background: '#EF4444', color: '#fff',
                    fontSize: '0.625rem', fontWeight: 700, padding: '0 4px',
                    border: '2px solid #fff',
                  }}>
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              /* Profile dropdown */
              <div ref={profileRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
                    borderRadius: 12, border: 'none', background: 'transparent',
                    cursor: 'pointer', transition: 'background .15s', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = T.lightBg; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <Avatar name={`${user.firstName} ${user.lastName}`} size="sm" />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: T.text, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.firstName}
                  </span>
                  <ChevronDown
                    size={16}
                    style={{ color: T.muted, transition: 'transform .2s', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0)' }}
                  />
                </button>

                {profileOpen && (
                  <div
                    className="animate-fade-in-down"
                    style={{
                      position: 'absolute', right: 0, marginTop: 8, width: 224,
                      borderRadius: 12, background: '#fff', border: `1px solid ${T.border}`,
                      boxShadow: '0 10px 40px rgba(0,0,0,.1)', padding: '6px 0', zIndex: 50,
                    }}
                  >
                    <div style={{ padding: '10px 16px', borderBottom: `1px solid ${T.border}` }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: T.text }}>
                        {user.firstName} {user.lastName}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: T.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.email}
                      </p>
                    </div>
                    {[
                      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                      { to: '/messages', label: 'Messages', icon: Bell },
                      { to: '/my-services', label: 'My Services', icon: BookOpen },
                      { to: '/my-bookings', label: 'My Bookings', icon: CalendarCheck },
                      { to: '/profile', label: 'Profile', icon: User },
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setProfileOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px',
                          fontSize: '0.875rem', color: T.text, textDecoration: 'none',
                          transition: 'background .15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = T.lightBg; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <item.icon size={16} style={{ color: T.muted }} />
                        {item.label}
                      </Link>
                    ))}
                    <div style={{ borderTop: `1px solid ${T.border}`, margin: '4px 0' }} />
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px',
                        fontSize: '0.875rem', color: '#EF4444', width: '100%', textAlign: 'left',
                        border: 'none', background: 'transparent', cursor: 'pointer',
                        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                        transition: 'background .15s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Auth buttons */
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              style={{
                padding: 8, borderRadius: 8, border: 'none', background: 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
              }}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun size={20} style={{ color: T.accent }} />
              ) : (
                <Moon size={20} style={{ color: T.muted }} />
              )}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                padding: 8, borderRadius: 8, border: 'none', background: 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
              }}
              aria-label="Menu"
            >
              {mobileOpen ? (
                <X size={24} style={{ color: T.text }} />
              ) : (
                <Menu size={24} style={{ color: T.text }} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ==================== Mobile Menu ==================== */}
      {mobileOpen && (
        <div
          className="md:hidden"
          style={{
            position: 'fixed', inset: 0, top: 64, zIndex: 50,
            background: '#fff', overflowY: 'auto',
            animation: 'fadeIn .2s ease',
          }}
        >
          <div style={{ padding: '24px 16px' }}>
            {/* Nav links */}
            {navLinks
              .filter((l) => !l.auth || user)
              .map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors"
                  style={({ isActive }) => ({
                    color: isActive ? T.accent : T.text,
                    background: isActive ? T.lightBg : 'transparent',
                  })}
                >
                  <link.icon size={20} style={{ color: T.muted }} />
                  {link.label}
                </NavLink>
              ))}

            {user && (
              <>
                <div style={{ borderTop: `1px solid ${T.border}`, margin: '16px 0' }} />
                {[
                  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                  { to: '/messages', label: 'Messages', icon: Bell },
                  { to: '/my-services', label: 'My Services', icon: BookOpen },
                  { to: '/my-bookings', label: 'My Bookings', icon: CalendarCheck },
                  { to: '/profile', label: 'Profile', icon: User },
                ].map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors"
                    style={({ isActive }) => ({
                      color: isActive ? T.accent : T.text,
                      background: isActive ? T.lightBg : 'transparent',
                    })}
                  >
                    <item.icon size={20} style={{ color: T.muted }} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.to === '/messages' && unreadCount > 0 && (
                      <span style={{
                        background: '#EF4444', color: '#fff', fontSize: '0.75rem',
                        padding: '2px 8px', borderRadius: 9999, fontWeight: 700,
                      }}>
                        {unreadCount}
                      </span>
                    )}
                  </NavLink>
                ))}
              </>
            )}

            <div style={{ borderTop: `1px solid ${T.border}`, margin: '16px 0' }} />

            {user ? (
              <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar name={`${user.firstName} ${user.lastName}`} size="md" />
                  <div>
                    <p style={{ fontWeight: 700, color: T.text }}>{user.firstName} {user.lastName}</p>
                    <p style={{ fontSize: '0.75rem', color: T.muted }}>{user.email}</p>
                  </div>
                </div>
                <Button variant="danger" size="md" className="w-full" onClick={handleLogout}>
                  <LogOut size={16} /> Sign Out
                </Button>
              </div>
            ) : (
              <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="lg" className="w-full">Log In</Button>
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" size="lg" className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
