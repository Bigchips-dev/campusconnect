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

const navLinks = [
  { to: '/services', label: 'Browse', icon: Search },
  { to: '/services/create', label: 'Post Service', icon: PlusCircle, auth: true },
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

  const linkClass = ({ isActive }) =>
    [
      'text-sm font-medium px-3 py-2 rounded-lg transition-colors duration-200',
      isActive
        ? 'text-primary-500 bg-primary-50 dark:bg-primary-950/30'
        : 'hover:text-primary-500 hover:bg-[var(--bg-muted)]',
    ].join(' ');

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 backdrop-blur-lg border-b"
      style={{
        backgroundColor: 'var(--bg-surface-overlay)',
        borderColor: 'var(--border-default)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-md shadow-primary-500/20">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <span
              className="text-lg font-bold hidden sm:block"
              style={{ color: 'var(--text-heading)' }}
            >
              Campus<span className="text-primary-500">Connect</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" style={{ color: 'var(--text-body)' }}>
            {navLinks
              .filter((l) => !l.auth || user)
              .map((link) => (
                <NavLink key={link.to} to={link.to} className={linkClass}>
                  {link.label}
                </NavLink>
              ))}
          </nav>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors cursor-pointer hover:bg-[var(--bg-muted)]"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-accent-400" />
              ) : (
                <Moon className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              )}
            </button>

            {user && (
              <Link
                to="/messages"
                className="relative p-2 rounded-lg transition-colors cursor-pointer hover:bg-[var(--bg-muted)]"
                aria-label="Messages"
              >
                <Bell className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-error-500 text-[10px] font-bold text-white ring-2 ring-[var(--bg-surface-overlay)] animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              /* Profile dropdown */
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl transition-colors cursor-pointer hover:bg-[var(--bg-muted)]"
                >
                  <Avatar name={`${user.firstName} ${user.lastName}`} size="sm" />
                  <span
                    className="text-sm font-medium max-w-[100px] truncate"
                    style={{ color: 'var(--text-heading)' }}
                  >
                    {user.firstName}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--text-muted)' }}
                  />
                </button>

                {profileOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl border py-1.5 animate-fade-in-down"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-default)',
                    }}
                  >
                    <div className="px-4 py-2.5 border-b" style={{ borderColor: 'var(--border-default)' }}>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
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
                        className="flex items-center gap-2.5 px-4 py-2 text-sm transition-colors hover:bg-[var(--bg-muted)]"
                        style={{ color: 'var(--text-body)' }}
                      >
                        <item.icon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                        {item.label}
                      </Link>
                    ))}
                    <div className="border-t my-1" style={{ borderColor: 'var(--border-default)' }} />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm w-full text-left transition-colors hover:bg-error-50 dark:hover:bg-error-700/10 text-error-500 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Auth buttons */
              <div className="flex items-center gap-2">
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
              className="p-2 rounded-lg transition-colors cursor-pointer hover:bg-[var(--bg-muted)]"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-accent-400" />
              ) : (
                <Moon className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              )}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg transition-colors cursor-pointer hover:bg-[var(--bg-muted)]"
              aria-label="Menu"
            >
              {mobileOpen ? (
                <X className="w-6 h-6" style={{ color: 'var(--text-heading)' }} />
              ) : (
                <Menu className="w-6 h-6" style={{ color: 'var(--text-heading)' }} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ==================== Mobile Menu ==================== */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 top-16 z-50 animate-fade-in overflow-y-auto"
          style={{ backgroundColor: 'var(--bg-base)' }}
        >
          <div className="px-4 py-6 space-y-1">
            {/* Nav links */}
            {navLinks
              .filter((l) => !l.auth || user)
              .map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-300'
                        : 'hover:bg-[var(--bg-muted)]',
                    ].join(' ')
                  }
                  style={{ color: 'var(--text-body)' }}
                >
                  <link.icon className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                  {link.label}
                </NavLink>
              ))}

            {user && (
              <>
                <div className="border-t my-4" style={{ borderColor: 'var(--border-default)' }} />
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
                    className={({ isActive }) =>
                      [
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors',
                        isActive
                          ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-300'
                          : 'hover:bg-[var(--bg-muted)]',
                      ].join(' ')
                    }
                    style={{ color: 'var(--text-body)' }}
                  >
                    <item.icon className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                    <span className="flex-1">{item.label}</span>
                    {item.to === '/messages' && unreadCount > 0 && (
                      <span className="bg-error-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </NavLink>
                ))}
              </>
            )}

            <div className="border-t my-4" style={{ borderColor: 'var(--border-default)' }} />

            {user ? (
              <div className="space-y-3 px-4">
                <div className="flex items-center gap-3">
                  <Avatar name={`${user.firstName} ${user.lastName}`} size="md" />
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-heading)' }}>
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                  </div>
                </div>
                <Button variant="danger" size="md" className="w-full" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" /> Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-3 px-4">
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
