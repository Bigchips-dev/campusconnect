import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  PlusCircle,
  Search,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  ChevronLeft,
  ChevronRight,
  Star,
  MessageSquare,
  X,
  Play,
  XCircle,
  AlertCircle,
  Check,
  Heart
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import api from '../lib/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';

const statusVariants = {
  PENDING: 'warning',
  ACCEPTED: 'active',
  REJECTED: 'cancelled',
  COMPLETED: 'completed',
  CANCELLED: 'default',
};

export default function Dashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Roles checking
  const isProviderOnly = user?.activeRoles?.includes('PROVIDER') && !user?.activeRoles?.includes('SEEKER');
  const isSeekerOnly = user?.activeRoles?.includes('SEEKER') && !user?.activeRoles?.includes('PROVIDER');
  const isBoth = user?.activeRoles?.includes('SEEKER') && user?.activeRoles?.includes('PROVIDER');

  // Tab state for BOTH roles
  const [activeTab, setActiveTab] = useState(() => {
    if (isBoth) {
      return localStorage.getItem('dashboardActiveTab') || 'seeker';
    }
    return isProviderOnly ? 'provider' : 'seeker';
  });

  // Remember active tab
  useEffect(() => {
    if (isBoth) {
      localStorage.setItem('dashboardActiveTab', activeTab);
    }
  }, [activeTab, isBoth]);

  // Seeker data state
  const [seekerBookings, setSeekerBookings] = useState([]);
  // Provider data state
  const [providerBookings, setProviderBookings] = useState([]);
  const [providerServices, setProviderServices] = useState([]);

  // General Loading state
  const [loading, setLoading] = useState(true);

  // Countdown timer for next booking
  const [countdownText, setCountdownText] = useState('');

  // Favorites state
  const [favoriteProviders, setFavoriteProviders] = useState(() => {
    return JSON.parse(localStorage.getItem('favoriteProviders') || '[]');
  });

  // Earnings summary chart toggle (weekly / monthly)
  const [chartInterval, setChartInterval] = useState('weekly');

  // Custom Calendar widget state
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);

  // Review Modal State
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedBookingIds, setReviewedBookingIds] = useState(() => {
    return JSON.parse(localStorage.getItem('reviewedBookingIds') || '[]');
  });

  // Fetch Dashboard details based on role
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
        promises.push(
          api.get(`/services?providerId=${user.id}&includeInactive=true`).then((res) => res.data.services)
        );
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

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Countdown timer calculation
  useEffect(() => {
    const upcoming = seekerBookings
      .filter((b) => b.status === 'ACCEPTED' && b.scheduledAt && new Date(b.scheduledAt) > new Date())
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

    if (upcoming.length === 0) {
      setCountdownText('No upcoming bookings scheduled.');
      return;
    }

    const nextBooking = upcoming[0];
    const interval = setInterval(() => {
      const diff = new Date(nextBooking.scheduledAt) - new Date();
      if (diff <= 0) {
        setCountdownText('Booking starting now!');
        clearInterval(interval);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        let text = '';
        if (days > 0) text += `${days}d `;
        text += `${hours}h ${minutes}m ${seconds}s`;
        setCountdownText(text);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [seekerBookings]);

  // Seeker actions
  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: 'CANCELLED' });
      setSeekerBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
      );
      addToast({ type: 'success', message: 'Booking cancelled successfully' });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: 'Failed to cancel booking' });
    }
  };

  // Provider incoming booking controls
  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status });
      setProviderBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
      );
      addToast({
        type: 'success',
        message: `Booking request ${status === 'ACCEPTED' ? 'accepted' : status === 'REJECTED' ? 'declined' : 'completed'}!`,
      });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      addToast({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update booking status',
      });
    }
  };

  // Review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        serviceId: reviewingBooking.serviceId,
        rating: reviewRating,
        comment: reviewComment,
      });

      // Add to local reviewed IDs
      const nextReviewed = [...reviewedBookingIds, reviewingBooking.id];
      setReviewedBookingIds(nextReviewed);
      localStorage.setItem('reviewedBookingIds', JSON.stringify(nextReviewed));

      addToast({ type: 'success', message: 'Review submitted successfully!' });
      setReviewingBooking(null);
      setReviewComment('');
      setReviewRating(5);
    } catch (err) {
      console.error(err);
      addToast({
        type: 'error',
        message: err.response?.data?.message || 'Failed to submit review',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  // Remove Favorite Provider
  const handleRemoveFavorite = (providerId) => {
    const updated = favoriteProviders.filter((p) => p.id !== providerId);
    setFavoriteProviders(updated);
    localStorage.setItem('favoriteProviders', JSON.stringify(updated));
    addToast({ type: 'success', message: 'Provider removed from favorites' });
  };

  // --- Earnings Chart Logic (Weekly / Monthly sums) ---
  const getWeeklyData = () => {
    const data = [0, 0, 0, 0, 0, 0, 0];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();

    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    providerBookings.forEach((b) => {
      if (b.status === 'COMPLETED' && b.scheduledAt) {
        const date = new Date(b.scheduledAt);
        const diffDays = Math.floor((date - startOfWeek) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          data[diffDays] += Number(b.service.price);
        }
      }
    });

    const max = Math.max(...data, 1);
    return { data, labels: days, max };
  };

  const getMonthlyData = () => {
    const data = [0, 0, 0, 0, 0, 0];
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
          const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          if (date.getMonth() === targetDate.getMonth() && date.getFullYear() === targetDate.getFullYear()) {
            data[5 - i] += Number(b.service.price);
          }
        }
      }
    });

    const max = Math.max(...data, 1);
    return { data, labels, max };
  };

  const chartInfo = chartInterval === 'weekly' ? getWeeklyData() : getMonthlyData();

  // --- Calendar Builder Logic ---
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayIndex = getFirstDayOfMonth(currentMonth, currentYear);

  const prevMonthDays = getDaysInMonth(currentMonth === 0 ? 11 : currentMonth - 1, currentMonth === 0 ? currentYear - 1 : currentYear);

  const calendarDays = [];
  // Prev month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      date: new Date(currentMonth === 0 ? currentYear - 1 : currentYear, currentMonth === 0 ? 11 : currentMonth - 1, prevMonthDays - i),
    });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(currentYear, currentMonth, i),
    });
  }
  // Next month padding
  const totalSlots = 42; // standard 6-row grid
  const remaining = totalSlots - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(currentMonth === 11 ? currentYear + 1 : currentYear, currentMonth === 11 ? 0 : currentMonth + 1, i),
    });
  }

  // Find bookings scheduled on a specific date
  const getBookingsForDate = (date) => {
    return providerBookings.filter((b) => {
      if (!b.scheduledAt || b.status !== 'ACCEPTED') return false;
      const bDate = new Date(b.scheduledAt);
      return (
        bDate.getDate() === date.getDate() &&
        bDate.getMonth() === date.getMonth() &&
        bDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedCalendarDate(null);
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedCalendarDate(null);
  };

  // Seeker statistics
  const totalSeekerBookings = seekerBookings.length;
  const pendingSeekerBookings = seekerBookings.filter((b) => b.status === 'PENDING').length;
  const completedSeekerBookings = seekerBookings.filter((b) => b.status === 'COMPLETED').length;

  // Provider statistics
  const totalProviderBookings = providerBookings.filter((b) => b.status === 'COMPLETED').length;
  const pendingProviderRequests = providerBookings.filter((b) => b.status === 'PENDING').length;
  const activeProviderServices = providerServices.filter((s) => s.isActive).length;
  const totalEarnings = providerBookings
    .filter((b) => b.status === 'COMPLETED')
    .reduce((acc, b) => acc + Number(b.service.price), 0);

  // Compute Provider Rating from active listings
  const activeRatings = providerServices.map((s) => s.avgRating).filter((r) => r > 0);
  const overallProviderRating =
    activeRatings.length > 0
      ? (activeRatings.reduce((acc, r) => acc + r, 0) / activeRatings.length).toFixed(1)
      : 'No reviews';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* Top Welcome Title & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black" style={{ color: 'var(--text-heading)' }}>
            Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Welcome back, {user?.firstName}! Here is what is happening with your account.
          </p>
        </div>

        {/* Dynamic Tab Toggle (BOTH) */}
        {isBoth && (
          <div className="flex bg-[var(--bg-surface-raised)] border border-[var(--border-default)] p-1 rounded-xl self-start sm:self-auto shadow-sm">
            <button
              onClick={() => setActiveTab('seeker')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'seeker'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
              }`}
            >
              My Bookings
            </button>
            <button
              onClick={() => setActiveTab('provider')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'provider'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
              }`}
            >
              My Services
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton variant="heading" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
          <Skeleton variant="listing" />
        </div>
      ) : (
        <div className="animate-fade-in space-y-8">
          
          {/* ==================================================== */}
          {/* ROLE 1: SEEKER VIEW */}
          {/* ==================================================== */}
          {activeTab === 'seeker' && (
            <div className="space-y-8">
              {/* Welcome Banner */}
              <div className="surface p-6 sm:p-8 rounded-3xl border border-[var(--border-default)] flex items-center gap-4 bg-gradient-to-r from-primary-500/10 via-transparent to-transparent">
                <Avatar
                  src={user?.avatarUrl}
                  name={`${user?.firstName} ${user?.lastName}`}
                  size="lg"
                  className="w-16 h-16 sm:w-20 sm:h-20 shadow-md border border-primary-500/20"
                />
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[var(--text-heading)]">
                    Welcome, {user?.firstName}! 👋
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                    Manage your bookings, track scheduled sessions, and review providers.
                  </p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Card hover={false} className="flex items-center gap-4 p-5">
                  <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 flex-shrink-0 shadow-sm">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-[var(--text-heading)]">{totalSeekerBookings}</p>
                    <p className="text-xs text-[var(--text-muted)] font-medium">Total Bookings</p>
                  </div>
                </Card>

                <Card hover={false} className="flex items-center gap-4 p-5">
                  <div className="w-12 h-12 rounded-2xl bg-warning-500/10 flex items-center justify-center text-warning-500 flex-shrink-0 shadow-sm">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-[var(--text-heading)]">{pendingSeekerBookings}</p>
                    <p className="text-xs text-[var(--text-muted)] font-medium">Pending Approvals</p>
                  </div>
                </Card>

                <Card hover={false} className="flex items-center gap-4 p-5">
                  <div className="w-12 h-12 rounded-2xl bg-success-500/10 flex items-center justify-center text-success-500 flex-shrink-0 shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-[var(--text-heading)]">{completedSeekerBookings}</p>
                    <p className="text-xs text-[var(--text-muted)] font-medium">Sessions Completed</p>
                  </div>
                </Card>
              </div>

              {/* Two-Column split for Seeker Details */}
              <div className="grid lg:grid-cols-3 gap-8 items-start">
                
                {/* Left Column (65%): Bookings lists */}
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* Countdown to Next Booking */}
                  <Card hover={false} className="p-6 bg-gradient-to-r from-[#1b0a3a] to-[#0D0A1E] text-white border-none shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />
                    <h3 className="text-xs uppercase font-black text-primary-200 tracking-wider">
                      Countdown to Next Session
                    </h3>
                    <p className="text-2xl sm:text-3xl font-black mt-2 tracking-tight text-accent-400">
                      {countdownText}
                    </p>
                  </Card>

                  {/* Pending Bookings Section */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
                      Pending Approvals
                    </h3>
                    {seekerBookings.filter((b) => b.status === 'PENDING').length > 0 ? (
                      <div className="space-y-4">
                        {seekerBookings
                          .filter((b) => b.status === 'PENDING')
                          .map((booking) => (
                            <div
                              key={booking.id}
                              className="surface p-5 border border-[var(--border-default)] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div className="space-y-2">
                                <h4 className="font-bold text-sm text-[var(--text-heading)]">
                                  {booking.service?.title}
                                </h4>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)] font-semibold">
                                  <span>Provider: {booking.service?.provider?.firstName} {booking.service?.provider?.lastName}</span>
                                  {booking.scheduledAt && (
                                    <>
                                      <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                      <span>Date: {new Date(booking.scheduledAt).toLocaleString()}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 self-end sm:self-auto">
                                <Badge variant="pending">Pending</Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 border border-red-200 dark:border-red-950/40 hover:bg-red-50 dark:hover:bg-red-950/10 font-bold"
                                  onClick={() => handleCancelBooking(booking.id)}
                                >
                                  Cancel Request
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={Clock}
                        title="No pending booking requests"
                        description="Book a provider service from the categories list to request scheduled slots."
                      />
                    )}
                  </div>

                  {/* Past Bookings Section */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
                      Past Sessions & History
                    </h3>
                    {seekerBookings.filter((b) => ['COMPLETED', 'REJECTED', 'CANCELLED'].includes(b.status)).length > 0 ? (
                      <div className="space-y-4">
                        {seekerBookings
                          .filter((b) => ['COMPLETED', 'REJECTED', 'CANCELLED'].includes(b.status))
                          .map((booking) => {
                            const isCompleted = booking.status === 'COMPLETED';
                            const hasReviewed = reviewedBookingIds.includes(booking.id);
                            return (
                              <div
                                key={booking.id}
                                className="surface p-5 border border-[var(--border-default)] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                              >
                                <div className="space-y-1">
                                  <h4 className="font-bold text-sm text-[var(--text-heading)]">
                                    {booking.service?.title}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)] font-semibold">
                                    <span>Provider: {booking.service?.provider?.firstName} {booking.service?.provider?.lastName}</span>
                                    {booking.scheduledAt && (
                                      <>
                                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                        <span>Date: {new Date(booking.scheduledAt).toLocaleDateString()}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 self-end sm:self-auto">
                                  <Badge variant={statusVariants[booking.status]}>
                                    {booking.status}
                                  </Badge>

                                  {/* Review option */}
                                  {isCompleted && !hasReviewed && (
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      className="font-bold shadow-md shadow-primary-500/10"
                                      onClick={() => setReviewingBooking(booking)}
                                    >
                                      Leave a Review
                                    </Button>
                                  )}
                                  {hasReviewed && (
                                    <span className="text-xs font-semibold text-success-600 dark:text-success-400 py-1 px-2.5 rounded-lg bg-success-50 dark:bg-success-950/20">
                                      Reviewed
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <EmptyState
                        icon={Calendar}
                        title="No past sessions"
                        description="Your completed, rejected, or cancelled bookings will be listed here."
                      />
                    )}
                  </div>
                </div>

                {/* Right Column (35%): Favorites */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
                      Favorite Providers
                    </h3>
                    {favoriteProviders.length > 0 ? (
                      <div className="space-y-3">
                        {favoriteProviders.map((prov) => (
                          <div
                            key={prov.id}
                            className="surface p-4 rounded-2xl border border-[var(--border-default)] flex items-center justify-between gap-3 hover:shadow-md transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar src={prov.avatarUrl} name={prov.name} size="sm" />
                              <div className="min-w-0">
                                <h4 className="font-bold text-sm text-[var(--text-heading)] truncate">
                                  {prov.name}
                                </h4>
                                <p className="text-[10px] text-[var(--text-muted)] truncate">
                                  {prov.university}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="xs"
                                className="font-bold text-primary-500"
                                onClick={() => navigate(`/services?category=ACADEMIC_TUTORING` /* Navigate to browse */)}
                              >
                                View
                              </Button>
                              <button
                                onClick={() => handleRemoveFavorite(prov.id)}
                                className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/10 text-red-500 cursor-pointer"
                                title="Remove favorite"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="surface p-6 rounded-2xl text-center border border-dashed border-[var(--border-default)]">
                        <Heart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                          Your favorites list is empty. Add them from search result profile cards!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* ROLE 2: PROVIDER VIEW */}
          {/* ==================================================== */}
          {activeTab === 'provider' && (
            <div className="space-y-8">
              {/* Welcome Banner */}
              <div className="surface p-6 sm:p-8 rounded-3xl border border-[var(--border-default)] flex items-center gap-4 bg-gradient-to-r from-secondary-500/10 via-transparent to-transparent">
                <Avatar
                  src={user?.avatarUrl}
                  name={`${user?.firstName} ${user?.lastName}`}
                  size="lg"
                  className="w-16 h-16 sm:w-20 sm:h-20 shadow-md border border-secondary-500/20"
                />
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[var(--text-heading)]">
                    Welcome, {user?.firstName}! 👋
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 font-medium">
                    <span>Provider Dashboard</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <div className="flex items-center gap-1 text-[var(--text-heading)]">
                      <Star className="w-4 h-4 text-accent-400 fill-accent-400" />
                      <span className="font-bold">{overallProviderRating} Rating</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <Card hover={false} className="p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-success-500/10 text-success-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <DollarSign className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-[var(--text-heading)]">${totalEarnings}</p>
                    <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider">
                      Earnings
                    </p>
                  </div>
                </Card>

                <Card hover={false} className="p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <CheckCircle2 className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-[var(--text-heading)]">{totalProviderBookings}</p>
                    <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider">
                      Completed
                    </p>
                  </div>
                </Card>

                <Card hover={false} className="p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-secondary-500/10 text-secondary-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <BookOpen className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-[var(--text-heading)]">{activeProviderServices}</p>
                    <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider">
                      Listings
                    </p>
                  </div>
                </Card>

                <Card hover={false} className="p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-warning-500/10 text-warning-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Clock className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-[var(--text-heading)]">{pendingProviderRequests}</p>
                    <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider">
                      Requests
                    </p>
                  </div>
                </Card>
              </div>

              {/* Incoming booking requests */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
                  Incoming Booking Requests
                </h3>
                {providerBookings.filter((b) => b.status === 'PENDING').length > 0 ? (
                  <div className="space-y-4">
                    {providerBookings
                      .filter((b) => b.status === 'PENDING')
                      .map((booking) => (
                        <div
                          key={booking.id}
                          className="surface p-5 border border-[var(--border-default)] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-2">
                            <h4 className="font-bold text-sm text-[var(--text-heading)]">
                              Request for: {booking.service?.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)] font-semibold">
                              <span>Client: {booking.seeker?.firstName} {booking.seeker?.lastName}</span>
                              {booking.scheduledAt && (
                                <>
                                  <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                  <span>Slot: {new Date(booking.scheduledAt).toLocaleString()}</span>
                                </>
                              )}
                            </div>
                            {booking.message && (
                              <p className="text-xs bg-[var(--bg-muted)] p-2.5 rounded-xl border border-[var(--border-default)] max-w-xl text-[var(--text-body)]">
                                "{booking.message}"
                              </p>
                            )}
                          </div>

                          {/* Action controls */}
                          <div className="flex items-center gap-2 self-end md:self-auto">
                            <Button
                              variant="primary"
                              size="sm"
                              className="font-bold flex items-center gap-1 shadow-md shadow-primary-500/10"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'ACCEPTED')}
                            >
                              <Check className="w-4 h-4" /> Accept
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="font-bold text-red-500 border border-red-200 dark:border-red-950/40 hover:bg-red-50 dark:hover:bg-red-950/10"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'REJECTED')}
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Clock}
                    title="No pending requests"
                    description="You are all caught up! Booking requests from seekers will display here."
                  />
                )}
              </div>

              {/* Two Column details: Calendar & Chart */}
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* Calendar View Section (lg:col-span-7) */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
                    Upcoming Jobs Schedule
                  </h3>

                  <div className="surface p-5 sm:p-6 border border-[var(--border-default)] rounded-3xl space-y-4">
                    {/* Month selector */}
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-base text-[var(--text-heading)]">
                        {new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </h4>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={prevMonth}
                          className="p-1.5 rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-muted)] transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={nextMonth}
                          className="p-1.5 rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-muted)] transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Week Header */}
                    <div className="grid grid-cols-7 text-center text-[10px] font-black uppercase text-[var(--text-faint)] tracking-wider">
                      <span>Sun</span>
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                    </div>

                    {/* Day Grid */}
                    <div className="grid grid-cols-7 gap-1.5 text-center">
                      {calendarDays.map((cell, i) => {
                        const dayBookings = getBookingsForDate(cell.date);
                        const hasJobs = dayBookings.length > 0;
                        const isSelected =
                          selectedCalendarDate &&
                          selectedCalendarDate.getDate() === cell.date.getDate() &&
                          selectedCalendarDate.getMonth() === cell.date.getMonth() &&
                          selectedCalendarDate.getFullYear() === cell.date.getFullYear();

                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedCalendarDate(cell.date)}
                            className={`aspect-square p-1 rounded-xl flex flex-col justify-between items-center transition-all cursor-pointer relative ${
                              cell.isCurrentMonth
                                ? 'text-[var(--text-heading)] font-semibold'
                                : 'text-[var(--text-faint)]'
                            } ${
                              isSelected
                                ? 'bg-primary-500 text-white shadow-md'
                                : 'hover:bg-[var(--bg-muted)] border border-transparent'
                            }`}
                          >
                            <span className="text-xs">{cell.day}</span>
                            
                            {/* Dot marker for jobs */}
                            {hasJobs && (
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected ? 'bg-accent-400' : 'bg-secondary-500 animate-pulse'
                                }`}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Selected Date Details */}
                    {selectedCalendarDate && (
                      <div className="pt-4 border-t border-[var(--border-default)] animate-fade-in space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-xs text-[var(--text-heading)]">
                            Schedule on {selectedCalendarDate.toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </h5>
                          <button
                            onClick={() => setSelectedCalendarDate(null)}
                            className="text-[10px] font-bold text-primary-500 hover:underline"
                          >
                            Deselect
                          </button>
                        </div>

                        {getBookingsForDate(selectedCalendarDate).length > 0 ? (
                          <div className="space-y-3">
                            {getBookingsForDate(selectedCalendarDate).map((job) => (
                              <div
                                key={job.id}
                                className="bg-[var(--bg-muted)] border border-[var(--border-default)] p-4 rounded-xl flex items-center justify-between gap-4"
                              >
                                <div>
                                  <h6 className="font-bold text-sm text-[var(--text-heading)]">
                                    {job.service?.title}
                                  </h6>
                                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                    Client: {job.seeker?.firstName} ·{' '}
                                    {job.scheduledAt ? new Date(job.scheduledAt).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    }) : ''}
                                  </p>
                                </div>
                                <Button
                                  variant="primary"
                                  size="xs"
                                  className="font-bold flex items-center gap-1"
                                  style={{ backgroundColor: 'var(--color-success-500)', color: 'white' }}
                                  onClick={() => handleUpdateBookingStatus(job.id, 'COMPLETED')}
                                >
                                  Complete Job
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-[var(--text-muted)] italic">
                            No upcoming jobs scheduled for this date.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Earnings summary chart (lg:col-span-5) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
                      Earnings Chart
                    </h3>

                    {/* Chart toggle controls */}
                    <div className="flex bg-[var(--bg-surface-raised)] border border-[var(--border-default)] p-0.5 rounded-lg">
                      <button
                        onClick={() => setChartInterval('weekly')}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                          chartInterval === 'weekly'
                            ? 'bg-primary-500 text-white shadow-sm'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
                        }`}
                      >
                        Weekly
                      </button>
                      <button
                        onClick={() => setChartInterval('monthly')}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                          chartInterval === 'monthly'
                            ? 'bg-primary-500 text-white shadow-sm'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
                        }`}
                      >
                        Monthly
                      </button>
                    </div>
                  </div>

                  <Card hover={false} className="p-6 border border-[var(--border-default)]">
                    <div className="flex items-end justify-between h-48 pt-4 border-b border-[var(--border-default)] relative">
                      {/* Empty state overlay */}
                      {chartInfo.data.reduce((a, b) => a + b, 0) === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                          <p className="text-xs text-[var(--text-muted)] italic max-w-[180px]">
                            Completed booking payouts will populate this earnings graph.
                          </p>
                        </div>
                      )}

                      {/* Render columns */}
                      {chartInfo.data.map((val, i) => {
                        const percent = (val / chartInfo.max) * 100;
                        return (
                          <div key={i} className="flex flex-col items-center flex-1 group">
                            <div className="text-[9px] font-black text-primary-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              ${val}
                            </div>
                            <div
                              className="w-4 sm:w-6 rounded-t-md bg-gradient-to-t from-primary-500 to-secondary-500 transition-all duration-500 shadow-glow-primary"
                              style={{ height: `${percent || 4}%` }}
                            />
                            <div className="text-[10px] font-bold text-[var(--text-muted)] mt-2">
                              {chartInfo.labels[i]}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ==================== LEAVE A REVIEW MODAL ==================== */}
      {reviewingBooking && (
        <Modal
          isOpen={!!reviewingBooking}
          onClose={() => setReviewingBooking(null)}
          title={`Review your booking: ${reviewingBooking.service?.title}`}
        >
          <form onSubmit={handleReviewSubmit} className="space-y-5">
            {/* Rating Stars */}
            <div className="space-y-1.5 text-center">
              <label className="block text-xs font-bold text-[var(--text-body)]">Select Rating</label>
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((stars) => (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => setReviewRating(stars)}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        stars <= reviewRating
                          ? 'text-accent-400 fill-accent-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[var(--text-body)]">Comment (optional)</label>
              <textarea
                rows={4}
                placeholder="Share your experience booking this campus service..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-[var(--bg-muted)] border border-[var(--border-default)] text-[var(--text-body)] placeholder-[var(--text-faint)] focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all resize-none font-medium"
              />
            </div>

            {/* Submit Action */}
            <div className="flex gap-3 pt-3 border-t border-[var(--border-default)] justify-end">
              <Button
                type="button"
                variant="ghost"
                className="border border-[var(--border-default)]"
                onClick={() => setReviewingBooking(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={submittingEdit} className="font-bold">
                Publish Review
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
