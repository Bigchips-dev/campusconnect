import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Clock,
  MapPin,
  ArrowLeft,
  Calendar,
  MessageSquare,
  Sparkles,
  Award,
  CheckCircle,
  XCircle,
  HelpCircle,
  FileText,
  Mail,
  Phone
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import ListingCard from '../components/ui/ListingCard';
import Skeleton from '../components/ui/Skeleton';
import { CATEGORIES } from '../data/categories';

const pricingUnits = { HOURLY: '/hr', FIXED: '', FREE: '' };

export default function ServiceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Primary Page States
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [providerDetails, setProviderDetails] = useState(null);
  const [loadingProvider, setLoadingProvider] = useState(false);
  const [similarListings, setSimilarListings] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  // Booking Modal States
  const [bookingModal, setBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({ message: '', scheduledAt: '' });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Contact Modal States
  const [contactModal, setContactModal] = useState(false);

  // Fetch Service Core Data
  const fetchServiceData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/services/${id}`);
      setService(data.data);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: 'Failed to load listing details' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Fetch Provider Details Concurrently (Once service is loaded)
  useEffect(() => {
    if (service?.providerId) {
      setLoadingProvider(true);
      api.get(`/users/${service.providerId}`)
        .then((res) => setProviderDetails(res.data.data))
        .catch((err) => console.error(err))
        .finally(() => setLoadingProvider(false));
    }
  }, [service?.providerId]);

  // Fetch Similar Listings (Once service is loaded)
  useEffect(() => {
    if (service?.category) {
      setLoadingSimilar(true);
      api.get(`/services?category=${service.category}&limit=12`)
        .then((res) => {
          const list = res.data.data.services || [];
          // Filter out current listing
          const filtered = list.filter((s) => s.id !== service.id);
          // Sort on frontend: bookings received desc, then rating desc
          filtered.sort((a, b) => {
            const bookingsA = a._count?.bookings || 0;
            const bookingsB = b._count?.bookings || 0;
            if (bookingsB !== bookingsA) return bookingsB - bookingsA;
            return (b.avgRating || 0) - (a.avgRating || 0);
          });
          setSimilarListings(filtered.slice(0, 3));
        })
        .catch((err) => console.error(err))
        .finally(() => setLoadingSimilar(false));
    }
  }, [service?.category, service?.id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    try {
      await api.post('/bookings', {
        serviceId: id,
        message: bookingForm.message || undefined,
        scheduledAt: bookingForm.scheduledAt || undefined,
      });
      setBookingSuccess(true);
      addToast({ type: 'success', message: 'Booking request sent!' });
      setTimeout(() => {
        setBookingModal(false);
        setBookingSuccess(false);
        setBookingForm({ message: '', scheduledAt: '' });
      }, 2000);
    } catch (err) {
      addToast({
        type: 'error',
        message: err.response?.data?.message || 'Failed to submit booking',
      });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <Skeleton variant="heading" className="w-48" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton variant="listing" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton variant="card" />
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black" style={{ color: 'var(--text-heading)' }}>
          Service listing not found
        </h2>
        <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">
          The listing may have been deactivated by the provider or does not exist.
        </p>
        <Link to="/services">
          <Button variant="primary">Back to browse</Button>
        </Link>
      </div>
    );
  }

  // Find Category Info
  const catInfo = CATEGORIES.find((c) => c.id === service.category);
  const catLabel = catInfo ? catInfo.name : service.category;
  const catColor = catInfo ? catInfo.color : '#7C3AED';

  // Dynamic Content Generators based on Category
  const getIncludedItems = (category) => {
    switch (category) {
      case 'ACADEMIC_TUTORING':
        return [
          '1-on-1 personalized tutoring support',
          'Custom study notes and reference worksheets',
          'Access to past exam question repositories',
          'Continuous post-session question support via chat',
        ];
      case 'FOOD_CATERING':
        return [
          'Freshly prepared ingredients and condiments',
          'Eco-friendly packaging container and wrappers',
          'Custom diet modifications (vegan/allergen-safe options)',
          'Included disposable cutlery and napkins',
        ];
      case 'BEAUTY_GROOMING':
        return [
          'Pre-service style consultation session',
          'Premium hair/nail care styling products used',
          'Relaxing rinse and scalp conditioning (if hair service)',
          'Post-session maintenance guides',
        ];
      case 'TECH_DIGITAL':
        return [
          'Clean, commented source code submission',
          'Responsive design checks on phone/desktop viewports',
          'Up to 2 structural revisions',
          'Installation guides and system manuals',
        ];
      case 'FASHION_CLOTHING':
        return [
          'Custom body measurement analysis',
          'Material sourcing advice and guidance',
          'Double-stitched structural joins for durability',
          'Protective garment storage bag',
        ];
      case 'HOME_REPAIR':
        return [
          'Safety check and initial diagnostics',
          'All professional repair tools provided by specialist',
          'Clean up and debris removal after task completion',
          '30-day labor workmanship guarantee',
        ];
      case 'HEALTH_WELLNESS':
        return [
          'Custom fitness routine or meal calendar creation',
          'Real-time posture and breathing correction',
          'Weekly goal progress accountability checks',
          'Personalized lifestyle tip sheets',
        ];
      case 'CREATIVE_ARTS':
        return [
          'High-resolution raw files/photos delivery',
          'Professional color corrections and digital edits',
          'Standard commercial usage permissions',
          'Additional sizes optimized for social media',
        ];
      case 'LOGISTICS_ERRANDS':
        return [
          'Timely and secure transport execution',
          'Progress check-ins during shop/deliver route',
          'Receipt scanning and item verification',
          'Fragile/perishable goods insulation handling',
        ];
      case 'SPIRITUAL_CULTURAL':
        return [
          'Traditional attire or supply coordination',
          'Detailed cultural backdrop briefing',
          'Session structure planning guides',
          'Post-event feedback questionnaire',
        ];
      case 'WRITING_HELP':
        return [
          'Thorough grammar, structural flow, and editing scan',
          'Detailed suggestion comments in draft margin',
          'Plagiarism check summary report',
          'Format standard checking (APA/MLA/Harvard/etc.)',
        ];
      case 'PHONE_LAPTOP_REPAIR':
        return [
          'Complimentary diagnostic scanning check',
          'High-grade replacement screens or cell battery packs',
          'Dust extraction and fan cleanout',
          '90-day parts warranty backing',
        ];
      case 'RESEARCH_STUDY_HELP':
        return [
          'Data script execution reports (SPSS/Python/R)',
          'Cleaned spreadsheet datasets (CSV/Excel format)',
          'Clear visual charts and data graphs',
          'Methodology and logic write-up guides',
        ];
      case 'SPORTS_FITNESS':
        return [
          'Stretching and warming drill guide',
          'Focused sport skill drills training',
          'Video movement analysis session',
          'Hydration and metabolic energy tips',
        ];
      case 'HOUSING_CAMPUS_LIFE':
        return [
          'Access to local room database reviews',
          'Detailed roommate compatibility assessment',
          'Luggage moving lift and carry support',
          'Campus local coordinates shortcut guide map',
        ];
      case 'PRINTING_MEDIA':
        return [
          'High-quality heavy paper stocks used',
          'Vibrant high-resolution color calibration',
          'Choice of edge binding or lamination coating',
          'Complimentary sample test page run',
        ];
      case 'BUY_SELL_RENT':
        return [
          'Product condition check details',
          'Function verification review',
          'Safe campus coordinate hand-off coordination',
          'Flexible return or rental extensions',
        ];
      case 'CAREER_SELF_GROWTH':
        return [
          'Modern CV design restructuring',
          'LinkedIn profile copy audit draft',
          'Mock interview coaching review session',
          'Job application workflow tracking template',
        ];
      default:
        return [
          'Custom 1-on-1 peer assistance session',
          'All required tools and materials brought by provider',
          'Thorough clean-up of location after service',
          'Direct contact support via messaging panel',
        ];
    }
  };

  const getDeliveryTime = (category) => {
    switch (category) {
      case 'ACADEMIC_TUTORING':
      case 'HEALTH_WELLNESS':
      case 'SPORTS_FITNESS':
      case 'CAREER_SELF_GROWTH':
        return 'Scheduled slot time (typically 1-2 hours per session)';
      case 'FOOD_CATERING':
        return 'Within 1-3 hours (same-day delivery options available)';
      case 'LOGISTICS_ERRANDS':
      case 'PRINTING_MEDIA':
        return 'Same day delivery (typically within 4 hours)';
      case 'BEAUTY_GROOMING':
      case 'HOME_REPAIR':
      case 'PHONE_LAPTOP_REPAIR':
        return '1-2 days based on booking slot availability';
      case 'TECH_DIGITAL':
      case 'WRITING_HELP':
      case 'CREATIVE_ARTS':
      case 'RESEARCH_STUDY_HELP':
        return '3-5 business days (rush delivery options available)';
      default:
        return 'Flexible (scheduled with provider directly after booking)';
    }
  };

  const getClientPreference = (category) => {
    switch (category) {
      case 'ACADEMIC_TUTORING':
      case 'TECH_DIGITAL':
      case 'WRITING_HELP':
      case 'RESEARCH_STUDY_HELP':
      case 'CAREER_SELF_GROWTH':
        return 'Virtually (Online session via Zoom/Meet)';
      case 'FOOD_CATERING':
      case 'LOGISTICS_ERRANDS':
      case 'HOME_REPAIR':
        return 'Provider comes to client (Doorstep delivery/service)';
      case 'BEAUTY_GROOMING':
        return 'Client comes to provider (Studio/Dorm room visit)';
      default:
        return 'Flexible (Can meet at library/student center/virtually)';
    }
  };

  // Helper function to darken hex color
  const adjustBrightness = (hex, amount) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
  };

  const otherListings = providerDetails?.services?.filter((s) => s.id !== service.id) || [];

  return (
    <div className="page-wrapper page-container space-y-10">
      
      {/* Back Button */}
      <Link
        to="/services"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#6B7280] hover:text-[#0A0A0A] transition-colors mb-6 py-2"
      >
        <ArrowLeft className="w-5 h-5" /> Back to listings browser
      </Link>

      {/* ==================== TOP SECTION: BANNER ==================== */}
      <div
        className="relative w-full h-[250px] sm:h-[350px] flex items-end p-6 sm:p-10 text-white overflow-hidden rounded-3xl"
        style={{
          background: service.imageUrl
            ? `linear-gradient(to top, rgba(13, 10, 30, 0.95), rgba(13, 10, 30, 0.3)), url(${service.imageUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, ${catColor}, ${adjustBrightness(catColor, -40)})`,
        }}
      >
        {/* Glow backdrop inside banner */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] pointer-events-none" />

        <div className="relative z-10 w-full flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border"
                style={{
                  backgroundColor: `${catColor}20`,
                  color: '#ffffff',
                  borderColor: `${catColor}80`,
                }}
              >
                {catLabel}
              </span>
              <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-md text-white backdrop-blur-sm">
                Verified Listing
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight drop-shadow-md text-white">
              {service.title}
            </h1>
          </div>

          {/* Pricing tag */}
          <div className="flex-shrink-0 bg-navy-950/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-2xl text-center self-start sm:self-auto min-w-[150px]">
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Pricing</p>
            <p className="text-3xl font-black text-accent-400 mt-1">
              {service.pricingType === 'FREE' ? 'Free' : `$${Number(service.price).toFixed(0)}`}
              <span className="text-xs text-slate-300 font-medium">
                {pricingUnits[service.pricingType]}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ==================== MAIN CONTENT: TWO-COLUMN ==================== */}
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: 65% width */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Service Info / Details */}
          <Card hover={false} className="p-6 sm:p-8 space-y-6">
            <div className="space-y-3">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
                Service Description
              </h2>
              <p className="text-sm leading-relaxed text-[var(--text-body)] whitespace-pre-wrap">
                {service.description}
              </p>
            </div>

            <hr className="border-[var(--border-default)]" />

            {/* What is Included */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>
                What is included in this service
              </h3>
              <ul className="grid sm:grid-cols-2 gap-3">
                {getIncludedItems(service.category).map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                    <span className="text-[var(--text-body)]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <hr className="border-[var(--border-default)]" />

            {/* Timelines and Location Preferences */}
            <div className="grid sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <p className="text-xs uppercase font-black text-[var(--text-muted)] tracking-wider">
                  Estimated Completion
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Clock className="w-5 h-5 text-primary-500" />
                  <span style={{ color: 'var(--text-heading)' }}>
                    {getDeliveryTime(service.category)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase font-black text-[var(--text-muted)] tracking-wider">
                  Location Preference
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <MapPin className="w-5 h-5 text-secondary-500" />
                  <span style={{ color: 'var(--text-heading)' }}>
                    {getClientPreference(service.category)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Portfolio Image Gallery */}
          <Card hover={false} className="p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
              Work Portfolio
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                'bg-gradient-to-br from-primary-500/10 to-indigo-500/10',
                'bg-gradient-to-br from-secondary-500/10 to-pink-500/10',
                'bg-gradient-to-br from-accent-500/10 to-yellow-500/10',
              ].map((grad, i) => (
                <div
                  key={i}
                  className={`h-28 sm:h-36 rounded-xl border border-[var(--border-default)] overflow-hidden flex items-center justify-center relative group ${grad}`}
                >
                  <FileText className="w-8 h-8 text-[var(--text-faint)] opacity-50 group-hover:scale-110 transition-transform duration-200" />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                </div>
              ))}
            </div>
          </Card>

          {/* Reviews Section */}
          <Card hover={false} className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
                Client Reviews
              </h2>
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                <Star className="w-4 h-4 text-accent-400 fill-accent-400" />
                <span style={{ color: 'var(--text-heading)' }}>
                  {service.avgRating > 0 ? Number(service.avgRating).toFixed(1) : '0.0'}
                </span>
                <span className="text-xs text-[var(--text-muted)] font-normal">
                  ({service.reviews?.length || 0} reviews)
                </span>
              </div>
            </div>

            {service.reviews && service.reviews.length > 0 ? (
              <div className="space-y-4">
                {service.reviews.map((review) => (
                  <div key={review.id} className="flex gap-4 p-4 rounded-2xl bg-[var(--bg-muted)] border border-[var(--border-default)]">
                    <Avatar
                      name={`${review.reviewer.firstName} ${review.reviewer.lastName}`}
                      src={review.reviewer.avatarUrl}
                      size="sm"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-bold text-sm text-[var(--text-heading)]">
                          {review.reviewer.firstName} {review.reviewer.lastName}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= review.rating
                                  ? 'text-accent-400 fill-accent-400'
                                  : 'text-slate-300 dark:text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm leading-relaxed text-[var(--text-body)]">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Star}
                title="No reviews yet"
                description="This service hasn't received any reviews yet. Be the first to book and leave feedback!"
              />
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN: 35% width */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Provider details card */}
          <Card hover={false} className="p-6 sm:p-8 space-y-6 border border-[var(--border-default)]">
            <div className="text-center space-y-4">
              <Avatar
                name={`${service.provider.firstName} ${service.provider.lastName}`}
                src={service.provider.avatarUrl}
                className="w-20 h-20 mx-auto shadow-md border-2 border-primary-500/20"
              />
              <div>
                <h3 className="text-lg font-black" style={{ color: 'var(--text-heading)' }}>
                  {service.provider.firstName} {service.provider.lastName}
                </h3>
                <p className="text-xs font-semibold text-primary-500 mt-0.5">
                  {service.provider.university || 'Campus Student'}
                </p>
                {service.provider.faculty && (
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {service.provider.faculty}
                  </p>
                )}
              </div>
            </div>

            <hr className="border-[var(--border-default)]" />

            {/* Provider statistics & verification */}
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)] font-medium">Ratings</span>
                <div className="flex items-center gap-1 font-semibold text-[var(--text-heading)]">
                  <Star className="w-4 h-4 text-accent-400 fill-accent-400" />
                  {service.avgRating > 0 ? Number(service.avgRating).toFixed(1) : 'No reviews'}
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-[var(--text-muted)] font-medium">Completed Jobs</span>
                <span className="font-bold text-[var(--text-heading)]">
                  {providerDetails?.completedBookingsCount || 0} services
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[var(--text-muted)] font-medium">Account Status</span>
                <span className="inline-flex items-center gap-1 font-bold text-success-600 dark:text-success-400 text-xs uppercase">
                  <CheckCircle className="w-3.5 h-3.5 fill-none" />
                  {service.provider.emailVerified ? 'Email Verified' : 'Portal Active'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[var(--text-muted)] font-medium">Member Since</span>
                <span className="font-bold text-[var(--text-heading)]">
                  {service.provider.createdAt
                    ? new Date(service.provider.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'June 2026'}
                </span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="space-y-3 pt-4 border-t border-[var(--border-default)]">
              {user && user.id !== service.providerId ? (
                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center font-bold shadow-lg shadow-secondary-500/10"
                  style={{ backgroundColor: 'var(--color-secondary-500)', color: '#ffffff' }}
                  onClick={() => setBookingModal(true)}
                >
                  Book Now
                </Button>
              ) : !user ? (
                <Link to="/login" state={{ from: { pathname: `/listing/${id}` } }} className="w-full block">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full justify-center font-bold"
                    style={{ backgroundColor: 'var(--color-secondary-500)', color: '#ffffff' }}
                  >
                    Log in to Book
                  </Button>
                </Link>
              ) : (
                <p className="text-center text-xs font-semibold text-[var(--text-muted)] py-2 bg-[var(--bg-muted)] rounded-xl">
                  This is your service listing
                </p>
              )}

              {/* Message button */}
              {user?.id !== service.providerId && (
                <Button
                  variant="ghost"
                  size="md"
                  className="w-full justify-center font-bold border border-primary-500 text-primary-500 hover:bg-primary-500/10 transition-colors"
                  onClick={() => navigate(`/messages?providerId=${service.providerId}`)}
                >
                  Message Provider
                </Button>
              )}
            </div>
          </Card>

          {/* Provider's other listings */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>
              Other listings from {service.provider.firstName}
            </h3>
            {loadingProvider ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} variant="text" />
                ))}
              </div>
            ) : otherListings.length > 0 ? (
              <div className="space-y-3">
                {otherListings.map((list) => (
                  <Link
                    key={list.id}
                    to={`/listing/${list.id}`}
                    className="surface p-4 rounded-2xl border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-all flex items-center justify-between gap-4 group"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-[var(--text-heading)] truncate group-hover:text-primary-500 transition-colors">
                        {list.title}
                      </h4>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        ${Number(list.price).toFixed(0)}
                        {list.pricingType === 'HOURLY' ? '/hr' : ''}
                      </p>
                    </div>
                    <Star className="w-4 h-4 text-accent-400 fill-accent-400 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)] italic">
                No other listings by this provider.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* ==================== SIMILAR LISTINGS ==================== */}
      <section className="space-y-6 pt-10 border-t border-[var(--border-default)]">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>
            Similar Listings
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Explore other highly rated campus services in {catLabel}.
          </p>
        </div>

        {loadingSimilar ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="listing" />
            ))}
          </div>
        ) : similarListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarListings.map((list) => (
              <ListingCard
                key={list.id}
                image={list.imageUrl}
                title={list.title}
                description={list.description}
                category={list.category}
                price={list.price}
                pricingType={list.pricingType}
                rating={list.avgRating || 0}
                reviewCount={list._count?.reviews || 0}
                provider={list.provider}
                actionLabel="View Details"
                onClick={() => navigate(`/listing/${list.id}`)}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)] italic">
            No similar services listed yet.
          </p>
        )}
      </section>

      {/* ==================== BOOKING MODAL ==================== */}
      <Modal isOpen={bookingModal} onClose={() => setBookingModal(false)} title="Book Service">
        {bookingSuccess ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-3">✅</div>
            <h3 className="text-lg font-bold">Booking Request Sent!</h3>
            <p className="text-sm text-surface-200/60 mt-1">
              The provider will review your schedule request.
            </p>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="space-y-5">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[var(--text-body)]">Message (optional)</label>
              <textarea
                rows={3}
                placeholder="Give the provider some details about what you need..."
                value={bookingForm.message}
                onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                className="w-full px-4 py-2 text-sm rounded-xl bg-[var(--bg-muted)] border border-[var(--border-default)] text-[var(--text-body)] placeholder-[var(--text-faint)] focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all resize-none font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[var(--text-body)]">Preferred Date/Time (optional)</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
                <input
                  type="datetime-local"
                  value={bookingForm.scheduledAt}
                  onChange={(e) => setBookingForm({ ...bookingForm, scheduledAt: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-[var(--bg-muted)] border border-[var(--border-default)] text-[var(--text-body)] focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all font-medium"
                />
              </div>
            </div>

            <Button type="submit" className="w-full justify-center font-bold" size="lg" loading={bookingLoading}>
              Send Booking Request
            </Button>
          </form>
        )}
      </Modal>


    </div>
  );
}
