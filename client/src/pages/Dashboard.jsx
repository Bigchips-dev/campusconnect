import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, Clock, CheckCircle2, PlusCircle, Search, Calendar,
  DollarSign, TrendingUp, Award, ChevronLeft, ChevronRight,
  Star, MessageSquare, X, Play, XCircle, AlertCircle, Check, Heart,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import api from '../lib/api';
import Avatar from '../components/ui/Avatar';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

/* ─── Design tokens ──────────────────────────────────────────────────────── */
const T = {
  bg: '#ffffff',
  text: '#0A0A0A',
  muted: '#6B7280',
  border: '#E5E7EB',
  accent: '#F59E0B',
  lightBg: '#FAFAFA',
};

/* ─── CSS injected once ───────────────────────────────────────────────────── */
const GLOBAL_STYLE = `
  @keyframes cc-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
  .cc-shimmer { background:#F3F4F6; animation: cc-pulse 1.6s ease-in-out infinite; border-radius:8px; }
  @keyframes cc-fadein { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .cc-fadein { animation: cc-fadein .35s ease both; }
  .listing-scroll { display:flex; gap:14px; overflow-x:auto; padding-bottom:6px; }
  .listing-scroll::-webkit-scrollbar { height:4px; }
  .listing-scroll::-webkit-scrollbar-thumb { background:#E5E7EB; border-radius:4px; }
  @media (max-width:640px) {
    .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
    .stats-grid-3 { grid-template-columns: 1fr !important; }
    .two-col { grid-template-columns: 1fr !important; }
  }
`;

/* ─── Status badge ───────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    PENDING:   { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
    ACCEPTED:  { bg: '#0A0A0A', color: '#ffffff', label: 'Accepted' },
    REJECTED:  { bg: '#F3F4F6', color: '#6B7280', label: 'Declined' },
    COMPLETED: { bg: '#ECFDF5', color: '#065F46', label: 'Completed' },
    CANCELLED: { bg: '#F3F4F6', color: '#6B7280', label: 'Cancelled' },
  };
  const s = map[status] || { bg: '#F3F4F6', color: '#6B7280', label: status };
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 9999,
      fontSize: '0.75rem', fontWeight: 700,
      background: s.bg, color: s.color,
    }}>
      {s.label}
    </span>
  );
}

/* ─── Section heading ────────────────────────────────────────────────────── */
function SectionHeading({ children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: T.text, display: 'inline-block', paddingBottom: 6, borderBottom: `2.5px solid ${T.accent}` }}>
        {children}
      </h3>
    </div>
  );
}

/* ─── Stat card ──────────────────────────────────────────────────────────── */
function StatCard({ value, label, Icon, accent = false }) {
  return (
    <div style={{
      background: '#fff', border: `1px solid ${T.border}`, borderRadius: 14,
      padding: '24px 20px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Amber top line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: T.accent, borderRadius: '14px 14px 0 0' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: accent ? T.accent : T.text, lineHeight: 1, marginBottom: 8 }}>
            {value}
          </p>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: T.muted }}>{label}</p>
        </div>
        {Icon && (
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245,158,11,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={20} style={{ color: T.accent }} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Booking card (shared seeker/provider) ──────────────────────────────── */
function BookingCard({ booking, actions, meta }) {
  return (
    <div style={{
      background: '#fff', border: `1px solid ${T.border}`, borderRadius: 12, padding: '18px 20px',
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14,
    }}>
      <div>
        <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: T.text, marginBottom: 4 }}>
          {booking.service?.title || 'Untitled Service'}
        </p>
        {meta && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            {meta.map((m, i) => (
              <span key={i} style={{ fontSize: '0.8125rem', color: T.muted, fontWeight: 500 }}>{m}</span>
            ))}
          </div>
        )}
        {booking.message && (
          <p style={{ fontSize: '0.8125rem', color: T.muted, marginTop: 8, fontStyle: 'italic', maxWidth: 400 }}>
            "{booking.message}"
          </p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {actions}
      </div>
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────────────── */
function EmptyCard({ message, linkTo, linkLabel }) {
  return (
    <div style={{
      border: `1.5px dashed ${T.border}`, borderRadius: 12, padding: '32px 24px',
      textAlign: 'center', background: T.lightBg,
    }}>
      <p style={{ fontSize: '0.9375rem', color: T.muted, fontWeight: 500 }}>{message}</p>
      {linkTo && (
        <Link to={linkTo} style={{ display: 'inline-block', marginTop: 12, color: T.accent, fontWeight: 700, fontSize: '0.875rem' }}>
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

/* ─── Loading skeleton row ───────────────────────────────────────────────── */
function SkeletonCards({ count = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
          <div className="cc-shimmer" style={{ width: '50%', height: 16, marginBottom: 10 }} />
          <div className="cc-shimmer" style={{ width: '30%', height: 13 }} />
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ════════════════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  /* ── Role flags (unchanged) ── */
  const isProviderOnly = user?.activeRoles?.includes('PROVIDER') && !user?.activeRoles?.includes('SEEKER');
  const isSeekerOnly   = user?.activeRoles?.includes('SEEKER')   && !user?.activeRoles?.includes('PROVIDER');
  const isBoth         = user?.activeRoles?.includes('SEEKER')   &&  user?.activeRoles?.includes('PROVIDER');

  /* ── Tab state (unchanged) ── */
  const [activeTab, setActiveTab] = useState(() => {
    if (isBoth) return localStorage.getItem('dashboardActiveTab') || 'seeker';
    return isProviderOnly ? 'provider' : 'seeker';
  });
  useEffect(() => {
    if (isBoth) localStorage.setItem('dashboardActiveTab', activeTab);
  }, [activeTab, isBoth]);

  /* ── Data state (unchanged) ── */
  const [seekerBookings,   setSeekerBookings]   = useState([]);
  const [providerBookings, setProviderBookings] = useState([]);
  const [providerServices, setProviderServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countdownText, setCountdownText] = useState('');

  const [favoriteProviders, setFavoriteProviders] = useState(
    () => JSON.parse(localStorage.getItem('favoriteProviders') || '[]')
  );

  const [chartInterval, setChartInterval] = useState('weekly');

  /* ── Calendar state (unchanged) ── */
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear,  setCurrentYear]  = useState(today.getFullYear());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);

  /* ── Review modal state (unchanged) ── */
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [reviewRating,     setReviewRating]     = useState(5);
  const [reviewComment,    setReviewComment]    = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedBookingIds, setReviewedBookingIds] = useState(
    () => JSON.parse(localStorage.getItem('reviewedBookingIds') || '[]')
  );

  /* ── Data fetch (unchanged) ── */
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const promises = [];
      if (user?.activeRoles?.includes('SEEKER') || isBoth) {
        promises.push(api.get('/bookings/my?role=seeker').then((res) => res.data.data));
      } else {
        promises.push(Promise.resolve([]));
      }
      if (user?.activeRoles?.includes('PROVIDER') || isBoth) {
        promises.push(api.get('/bookings/my?role=provider').then((res) => res.data.data));
        promises.push(api.get(`/services?providerId=${user.id}&includeInactive=true`).then((res) => res.data.services));
      } else {
        promises.push(Promise.resolve([]));
        promises.push(Promise.resolve([]));
      }
      const [seekerRes, providerBookingsRes, providerServicesRes] = await Promise.all(promises);
      setSeekerBookings(seekerRes || []);
      setProviderBookings(providerBookingsRes || []);
      setProviderServices(providerServicesRes || []);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: 'Failed to retrieve dashboard details' });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { if (user) fetchDashboardData(); }, [user]);

  /* ── Countdown (unchanged) ── */
  useEffect(() => {
    const upcoming = seekerBookings
      .filter((b) => b.status === 'ACCEPTED' && b.scheduledAt && new Date(b.scheduledAt) > new Date())
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
    if (upcoming.length === 0) { setCountdownText('No upcoming bookings scheduled.'); return; }
    const nextBooking = upcoming[0];
    const interval = setInterval(() => {
      const diff = new Date(nextBooking.scheduledAt) - new Date();
      if (diff <= 0) { setCountdownText('Booking starting now!'); clearInterval(interval); return; }
      const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      let text = '';
      if (days > 0) text += `${days}d `;
      text += `${hours}h ${minutes}m ${seconds}s`;
      setCountdownText(text);
    }, 1000);
    return () => clearInterval(interval);
  }, [seekerBookings]);

  /* ── Handlers (unchanged) ── */
  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: 'CANCELLED' });
      setSeekerBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
      addToast({ type: 'success', message: 'Booking cancelled successfully' });
    } catch (err) { console.error(err); addToast({ type: 'error', message: 'Failed to cancel booking' }); }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status });
      setProviderBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status } : b));
      addToast({ type: 'success', message: `Booking request ${status === 'ACCEPTED' ? 'accepted' : status === 'REJECTED' ? 'declined' : 'completed'}!` });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to update booking status' });
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post('/reviews', { serviceId: reviewingBooking.serviceId, rating: reviewRating, comment: reviewComment });
      const nextReviewed = [...reviewedBookingIds, reviewingBooking.id];
      setReviewedBookingIds(nextReviewed);
      localStorage.setItem('reviewedBookingIds', JSON.stringify(nextReviewed));
      addToast({ type: 'success', message: 'Review submitted successfully!' });
      setReviewingBooking(null); setReviewComment(''); setReviewRating(5);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to submit review' });
    } finally { setSubmittingReview(false); }
  };

  const handleRemoveFavorite = (providerId) => {
    const updated = favoriteProviders.filter((p) => p.id !== providerId);
    setFavoriteProviders(updated);
    localStorage.setItem('favoriteProviders', JSON.stringify(updated));
    addToast({ type: 'success', message: 'Provider removed from favorites' });
  };

  /* ── Earnings chart (unchanged) ── */
  const getWeeklyData = () => {
    const data = [0,0,0,0,0,0,0];
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day + (day === 0 ? -6 : 1));
    startOfWeek.setHours(0,0,0,0);
    providerBookings.forEach((b) => {
      if (b.status === 'COMPLETED' && b.scheduledAt) {
        const date = new Date(b.scheduledAt);
        const diffDays = Math.floor((date - startOfWeek) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) data[diffDays] += Number(b.service.price);
      }
    });
    return { data, labels: days, max: Math.max(...data, 1) };
  };
  const getMonthlyData = () => {
    const data = [0,0,0,0,0,0];
    const labels = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(d.toLocaleDateString('en-US', { month: 'short' }));
    }
    providerBookings.forEach((b) => {
      if (b.status === 'COMPLETED' && b.scheduledAt) {
        const date = new Date(b.scheduledAt);
        for (let i = 5; i >= 0; i--) {
          const t = new Date(now.getFullYear(), now.getMonth() - i, 1);
          if (date.getMonth() === t.getMonth() && date.getFullYear() === t.getFullYear()) data[5 - i] += Number(b.service.price);
        }
      }
    });
    return { data, labels, max: Math.max(...data, 1) };
  };
  const chartInfo = chartInterval === 'weekly' ? getWeeklyData() : getMonthlyData();

  /* ── Calendar (unchanged) ── */
  const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (m, y) => new Date(y, m, 1).getDay();
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayIndex = getFirstDayOfMonth(currentMonth, currentYear);
  const prevMonthDays = getDaysInMonth(currentMonth === 0 ? 11 : currentMonth - 1, currentMonth === 0 ? currentYear - 1 : currentYear);
  const calendarDays = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarDays.push({ day: prevMonthDays - i, isCurrentMonth: false, date: new Date(currentMonth === 0 ? currentYear - 1 : currentYear, currentMonth === 0 ? 11 : currentMonth - 1, prevMonthDays - i) });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, isCurrentMonth: true, date: new Date(currentYear, currentMonth, i) });
  }
  const remaining = 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({ day: i, isCurrentMonth: false, date: new Date(currentMonth === 11 ? currentYear + 1 : currentYear, currentMonth === 11 ? 0 : currentMonth + 1, i) });
  }
  const getBookingsForDate = (date) =>
    providerBookings.filter((b) => {
      if (!b.scheduledAt || b.status !== 'ACCEPTED') return false;
      const bDate = new Date(b.scheduledAt);
      return bDate.getDate() === date.getDate() && bDate.getMonth() === date.getMonth() && bDate.getFullYear() === date.getFullYear();
    });
  const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); } else setCurrentMonth(currentMonth + 1); setSelectedCalendarDate(null); };
  const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); } else setCurrentMonth(currentMonth - 1); setSelectedCalendarDate(null); };

  /* ── Stats (unchanged) ── */
  const totalSeekerBookings    = seekerBookings.length;
  const pendingSeekerBookings  = seekerBookings.filter((b) => b.status === 'PENDING').length;
  const completedSeekerBookings= seekerBookings.filter((b) => b.status === 'COMPLETED').length;
  const totalProviderBookings  = providerBookings.filter((b) => b.status === 'COMPLETED').length;
  const pendingProviderRequests= providerBookings.filter((b) => b.status === 'PENDING').length;
  const activeProviderServices = providerServices.filter((s) => s.isActive).length;
  const totalEarnings          = providerBookings.filter((b) => b.status === 'COMPLETED').reduce((acc, b) => acc + Number(b.service.price), 0);
  const activeRatings          = providerServices.map((s) => s.avgRating).filter((r) => r > 0);
  const overallProviderRating  = activeRatings.length > 0 ? (activeRatings.reduce((a, r) => a + r, 0) / activeRatings.length).toFixed(1) : 'No reviews';

  /* ── Greeting ── */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  /* ──────────────────────────────────────────────────────────────────────────
     RENDER
  ────────────────────────────────────────────────────────────────────────── */
  return (
    <div style={{ background: T.bg, minHeight: '100vh', fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <style>{GLOBAL_STYLE}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 40px 80px' }} className="dashboard-wrap">

        {/* ── Top bar: greeting + role toggle ── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: T.text, letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 6 }}>
              {greeting}, {user?.firstName}.
            </h1>
            <p style={{ fontSize: '1rem', color: T.muted, fontWeight: 500 }}>Here's what's happening today.</p>
          </div>

          {/* Role toggle (only for both roles) */}
          {isBoth && (
            <div style={{ display: 'flex', background: '#F9FAFB', border: `1.5px solid ${T.border}`, borderRadius: 12, padding: 4, gap: 4 }}>
              {[['seeker', 'My Bookings'], ['provider', 'My Services']].map(([tab, label]) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '9px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', fontWeight: 700, fontSize: '0.875rem',
                    background: activeTab === tab ? '#0A0A0A' : 'transparent',
                    color: activeTab === tab ? '#fff' : T.muted,
                    transition: 'all .18s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Loading skeleton ── */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
              {[0,1,2,3].map((i) => <div key={i} className="cc-shimmer" style={{ height: 108, borderRadius: 14 }} />)}
            </div>
            <SkeletonCards count={3} />
          </div>
        ) : (
          <div className="cc-fadein">

            {/* ════════════════════════════════════════════════════════════
                SEEKER VIEW
               ════════════════════════════════════════════════════════════ */}
            {activeTab === 'seeker' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

                {/* Stats row */}
                <div className="stats-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                  <StatCard value={totalSeekerBookings}   label="Total Bookings"    Icon={BookOpen}    />
                  <StatCard value={pendingSeekerBookings}  label="Pending Approvals" Icon={Clock}       />
                  <StatCard value={completedSeekerBookings}label="Sessions Completed"Icon={CheckCircle2}/>
                </div>

                {/* Countdown banner */}
                <div style={{ background: '#0A0A0A', borderRadius: 14, padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, background: 'rgba(245,158,11,.12)', borderRadius: '50%' }} />
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    Countdown to Next Session
                  </p>
                  <p style={{ fontSize: '1.75rem', fontWeight: 800, color: T.accent, letterSpacing: '-0.02em' }}>
                    {countdownText}
                  </p>
                </div>

                {/* Two-column layout */}
                <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>

                  {/* Left: bookings */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

                    {/* Pending bookings */}
                    <div>
                      <SectionHeading>Pending Approvals</SectionHeading>
                      {seekerBookings.filter((b) => b.status === 'PENDING').length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {seekerBookings.filter((b) => b.status === 'PENDING').map((booking) => (
                            <BookingCard
                              key={booking.id}
                              booking={booking}
                              meta={[
                                `Provider: ${booking.service?.provider?.firstName} ${booking.service?.provider?.lastName}`,
                                booking.scheduledAt && `Date: ${new Date(booking.scheduledAt).toLocaleString()}`,
                              ].filter(Boolean)}
                              actions={
                                <>
                                  <StatusBadge status="PENDING" />
                                  <button
                                    onClick={() => handleCancelBooking(booking.id)}
                                    style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid #FCA5A5', background: '#FFF1F1', color: '#DC2626', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit' }}
                                  >
                                    Cancel
                                  </button>
                                </>
                              }
                            />
                          ))}
                        </div>
                      ) : (
                        <EmptyCard message="No pending requests right now. Book a service to get started!" linkTo="/services" linkLabel="Browse Services" />
                      )}
                    </div>

                    {/* Past bookings */}
                    <div>
                      <SectionHeading>Past Sessions & History</SectionHeading>
                      {seekerBookings.filter((b) => ['COMPLETED','REJECTED','CANCELLED'].includes(b.status)).length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {seekerBookings.filter((b) => ['COMPLETED','REJECTED','CANCELLED'].includes(b.status)).map((booking) => {
                            const isCompleted = booking.status === 'COMPLETED';
                            const hasReviewed = reviewedBookingIds.includes(booking.id);
                            return (
                              <BookingCard
                                key={booking.id}
                                booking={booking}
                                meta={[
                                  `Provider: ${booking.service?.provider?.firstName} ${booking.service?.provider?.lastName}`,
                                  booking.scheduledAt && new Date(booking.scheduledAt).toLocaleDateString(),
                                ].filter(Boolean)}
                                actions={
                                  <>
                                    <StatusBadge status={booking.status} />
                                    {isCompleted && !hasReviewed && (
                                      <button
                                        onClick={() => setReviewingBooking(booking)}
                                        style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: T.accent, color: T.text, fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit' }}
                                      >
                                        Leave a Review
                                      </button>
                                    )}
                                    {hasReviewed && (
                                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '4px 10px', borderRadius: 9999 }}>
                                        ✓ Reviewed
                                      </span>
                                    )}
                                  </>
                                }
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <EmptyCard message="Your completed, rejected, or cancelled bookings will appear here." />
                      )}
                    </div>
                  </div>

                  {/* Right: Favorite providers */}
                  <div>
                    <SectionHeading>Favourite Providers</SectionHeading>
                    {favoriteProviders.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {favoriteProviders.map((prov) => (
                          <div key={prov.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: `1px solid ${T.border}`, borderRadius: 12, padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                              <Avatar src={prov.avatarUrl} name={prov.name} size="sm" />
                              <div style={{ minWidth: 0 }}>
                                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prov.name}</p>
                                <p style={{ fontSize: '0.75rem', color: T.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prov.university}</p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                              <button onClick={() => navigate('/services')} style={{ fontSize: '0.75rem', fontWeight: 700, color: T.accent, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>View</button>
                              <button onClick={() => handleRemoveFavorite(prov.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}>
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ border: `1.5px dashed ${T.border}`, borderRadius: 12, padding: '28px 16px', textAlign: 'center', background: T.lightBg }}>
                        <Heart size={28} style={{ color: T.border, display: 'block', margin: '0 auto 10px' }} />
                        <p style={{ fontSize: '0.875rem', color: T.muted }}>No favourites yet. Add providers from their profile!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════
                PROVIDER VIEW
               ════════════════════════════════════════════════════════════ */}
            {activeTab === 'provider' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

                {/* Stats row */}
                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                  <StatCard value={`$${totalEarnings.toLocaleString()}`} label="Total Earnings"   Icon={DollarSign}   accent />
                  <StatCard value={totalProviderBookings}   label="Completed Jobs"     Icon={CheckCircle2} />
                  <StatCard value={activeProviderServices}  label="Active Listings"    Icon={BookOpen}     />
                  <StatCard value={pendingProviderRequests} label="Pending Requests"   Icon={Clock}        />
                </div>

                {/* Incoming requests */}
                <div>
                  <SectionHeading>Incoming Booking Requests</SectionHeading>
                  {providerBookings.filter((b) => b.status === 'PENDING').length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {providerBookings.filter((b) => b.status === 'PENDING').map((booking) => (
                        <BookingCard
                          key={booking.id}
                          booking={booking}
                          meta={[
                            `Client: ${booking.seeker?.firstName} ${booking.seeker?.lastName}`,
                            booking.scheduledAt && `Slot: ${new Date(booking.scheduledAt).toLocaleString()}`,
                          ].filter(Boolean)}
                          actions={
                            <>
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, 'ACCEPTED')}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 16px', borderRadius: 8, border: 'none', background: '#0A0A0A', color: '#fff', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit' }}
                              >
                                <Check size={14} /> Accept
                              </button>
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, 'REJECTED')}
                                style={{ padding: '7px 16px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: '#fff', color: T.muted, fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit' }}
                              >
                                Decline
                              </button>
                            </>
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyCard message="No pending requests — you're all caught up! Booking requests from seekers will appear here." />
                  )}
                </div>

                {/* Two-col: Calendar + Earnings Chart */}
                <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>

                  {/* Calendar */}
                  <div>
                    <SectionHeading>Upcoming Jobs Schedule</SectionHeading>
                    <div style={{ border: `1px solid ${T.border}`, borderRadius: 14, padding: '20px 20px 24px', background: '#fff' }}>
                      {/* Month nav */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: T.text }}>
                          {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {[prevMonth, nextMonth].map((fn, i) => (
                            <button key={i} onClick={fn} style={{ width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${T.border}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {i === 0 ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Day headers */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', textAlign: 'center', marginBottom: 8 }}>
                        {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
                          <span key={d} style={{ fontSize: '0.6875rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{d}</span>
                        ))}
                      </div>

                      {/* Day grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
                        {calendarDays.map((cell, i) => {
                          const dayBookings = getBookingsForDate(cell.date);
                          const hasJobs = dayBookings.length > 0;
                          const isSelected = selectedCalendarDate &&
                            selectedCalendarDate.getDate() === cell.date.getDate() &&
                            selectedCalendarDate.getMonth() === cell.date.getMonth() &&
                            selectedCalendarDate.getFullYear() === cell.date.getFullYear();
                          const isToday = today.getDate() === cell.date.getDate() && today.getMonth() === cell.date.getMonth() && today.getFullYear() === cell.date.getFullYear();

                          return (
                            <button
                              key={i}
                              onClick={() => setSelectedCalendarDate(cell.date)}
                              style={{
                                aspectRatio: '1', padding: 2, borderRadius: 8,
                                border: isToday ? `1.5px solid ${T.accent}` : '1.5px solid transparent',
                                background: isSelected ? '#0A0A0A' : 'transparent',
                                color: isSelected ? '#fff' : cell.isCurrentMonth ? T.text : '#D1D5DB',
                                fontWeight: cell.isCurrentMonth ? 600 : 400,
                                fontSize: '0.8125rem', cursor: 'pointer',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                gap: 2, transition: 'all .15s',
                              }}
                            >
                              <span>{cell.day}</span>
                              {hasJobs && (
                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: isSelected ? T.accent : T.accent, opacity: isSelected ? 1 : 0.8 }} />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Selected date jobs */}
                      {selectedCalendarDate && (
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <p style={{ fontWeight: 700, fontSize: '0.8125rem', color: T.text }}>
                              {selectedCalendarDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </p>
                            <button onClick={() => setSelectedCalendarDate(null)} style={{ fontSize: '0.75rem', fontWeight: 700, color: T.accent, background: 'none', border: 'none', cursor: 'pointer' }}>Clear</button>
                          </div>
                          {getBookingsForDate(selectedCalendarDate).length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {getBookingsForDate(selectedCalendarDate).map((job) => (
                                <div key={job.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.lightBg, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px' }}>
                                  <div>
                                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: T.text }}>{job.service?.title}</p>
                                    <p style={{ fontSize: '0.75rem', color: T.muted }}>
                                      {job.seeker?.firstName} · {job.scheduledAt ? new Date(job.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => handleUpdateBookingStatus(job.id, 'COMPLETED')}
                                    style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: '#10B981', color: '#fff', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}
                                  >
                                    Complete
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p style={{ fontSize: '0.8125rem', color: T.muted, fontStyle: 'italic' }}>No jobs scheduled for this date.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Earnings chart */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: T.text, display: 'inline-block', paddingBottom: 6, borderBottom: `2.5px solid ${T.accent}` }}>
                        Earnings Chart
                      </h3>
                      <div style={{ display: 'flex', background: '#F9FAFB', border: `1.5px solid ${T.border}`, borderRadius: 9, padding: 3, gap: 3 }}>
                        {['weekly','monthly'].map((iv) => (
                          <button
                            key={iv}
                            onClick={() => setChartInterval(iv)}
                            style={{ padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.75rem', textTransform: 'capitalize', background: chartInterval === iv ? '#0A0A0A' : 'transparent', color: chartInterval === iv ? '#fff' : T.muted, transition: 'all .15s' }}
                          >
                            {iv.charAt(0).toUpperCase() + iv.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ border: `1px solid ${T.border}`, borderRadius: 14, padding: '24px 20px', background: '#fff' }}>
                      {/* Total */}
                      <p style={{ fontSize: '1.75rem', fontWeight: 800, color: T.accent, marginBottom: 4 }}>
                        ${chartInfo.data.reduce((a, b) => a + b, 0).toLocaleString()}
                      </p>
                      <p style={{ fontSize: '0.8125rem', color: T.muted, marginBottom: 20 }}>
                        {chartInterval === 'weekly' ? 'This week' : 'Last 6 months'}
                      </p>

                      {/* Bar chart */}
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120, position: 'relative', paddingBottom: 24 }}>
                        {chartInfo.data.reduce((a, b) => a + b, 0) === 0 && (
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p style={{ fontSize: '0.8125rem', color: T.muted, fontStyle: 'italic', textAlign: 'center', maxWidth: 200 }}>
                              Completed booking payouts will populate this graph.
                            </p>
                          </div>
                        )}
                        {chartInfo.data.map((val, i) => {
                          const pct = (val / chartInfo.max) * 100;
                          return (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                              <div style={{ width: '100%', borderRadius: '4px 4px 0 0', background: val > 0 ? T.accent : '#E5E7EB', height: `${pct || 4}%`, transition: 'height .4s ease', minHeight: 4 }} />
                              <span style={{ fontSize: '0.625rem', fontWeight: 700, color: T.muted, position: 'absolute', bottom: 0 }}>{chartInfo.labels[i]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Active listings quick view */}
                    {providerServices.filter((s) => s.isActive).length > 0 && (
                      <div style={{ marginTop: 28 }}>
                        <SectionHeading>Active Listings</SectionHeading>
                        <div className="listing-scroll">
                          {providerServices.filter((s) => s.isActive).map((s) => (
                            <div key={s.id} onClick={() => navigate(`/listing/${s.id}`)} style={{ flexShrink: 0, width: 180, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 14px 12px', cursor: 'pointer', background: '#fff' }}
                              onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.accent)}
                              onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.border)}
                            >
                              <p style={{ fontWeight: 700, fontSize: '0.875rem', color: T.text, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</p>
                              <p style={{ fontSize: '0.9375rem', fontWeight: 800, color: T.accent, marginBottom: 4 }}>${Number(s.price).toFixed(0)}</p>
                              <p style={{ fontSize: '0.75rem', color: T.muted }}>{s._count?.bookings || 0} bookings</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* ══ Review Modal (unchanged logic) ═══════════════════════════════════ */}
      {reviewingBooking && (
        <Modal
          isOpen={!!reviewingBooking}
          onClose={() => setReviewingBooking(null)}
          title={`Review: ${reviewingBooking.service?.title}`}
        >
          <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Stars */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: T.text, marginBottom: 12 }}>Select Rating</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                {[1,2,3,4,5].map((stars) => (
                  <button key={stars} type="button" onClick={() => setReviewRating(stars)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                    <Star size={32} style={{ color: stars <= reviewRating ? T.accent : '#E5E7EB', fill: stars <= reviewRating ? T.accent : '#E5E7EB' }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: T.text, marginBottom: 8 }}>Comment (optional)</label>
              <textarea
                rows={4}
                placeholder="Share your experience booking this campus service..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', border: `1.5px solid ${T.border}`, borderRadius: 10, fontSize: '0.9375rem', color: T.text, fontFamily: 'inherit', resize: 'none', outline: 'none', boxSizing: 'border-box' }}
                onFocus={(e) => { e.target.style.borderColor = T.accent; }}
                onBlur={(e) => { e.target.style.borderColor = T.border; }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
              <button type="button" onClick={() => setReviewingBooking(null)} style={{ padding: '9px 20px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: '#fff', color: T.muted, fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button type="submit" disabled={submittingReview} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: T.accent, color: T.text, fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', fontFamily: 'inherit', opacity: submittingReview ? 0.6 : 1 }}>
                {submittingReview ? 'Submitting…' : 'Publish Review'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
