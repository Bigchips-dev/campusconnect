import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Plus,
  BookOpen,
  UserCheck,
  Search,
  CalendarCheck,
  Sparkles,
  UtensilsCrossed,
  HelpCircle,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';
import Button from '../components/ui/Button';
import ListingCard from '../components/ui/ListingCard';
import ServiceCategoryCard from '../components/ui/ServiceCategoryCard';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { CATEGORIES } from '../data/categories';
import { getCategoryIcon } from '../lib/categoryIcons';

// --- ScrollReveal Component using IntersectionObserver ---
function ScrollReveal({ children, delay = 0, className = '' }) {
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
      {
        threshold: 0.05,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    const current = ref.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out transform ${className}`}
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translateY(0)' : 'translateY(24px)',
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for role-based sections
  const [popularListings, setPopularListings] = useState([]);
  const [seekerRecommendations, setSeekerRecommendations] = useState([]);
  const [providerListings, setProviderListings] = useState([]);

  // Loaders
  const [loadingPopular, setLoadingPopular] = useState(false);
  const [loadingSeeker, setLoadingSeeker] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(false);

  const isProvider = user?.activeRoles?.includes('PROVIDER');
  const isSeeker = user?.activeRoles?.includes('SEEKER');
  const isBoth = isProvider && isSeeker;
  const isGuest = !user;

  // Fetching data based on auth status
  useEffect(() => {
    if (isGuest) {
      setLoadingPopular(true);
      api.get('/services?limit=6')
        .then((res) => {
          setPopularListings(res.data.data.services || []);
        })
        .catch((err) => console.error('Error fetching popular services:', err))
        .finally(() => setLoadingPopular(false));
    }
  }, [isGuest]);

  useEffect(() => {
    if (user && (isSeeker || isBoth)) {
      setLoadingSeeker(true);
      const categoryFilter = user.interests && user.interests.length > 0
        ? `&category=${user.interests.join(',')}`
        : '';
      api.get(`/services?limit=6${categoryFilter}`)
        .then((res) => {
          setSeekerRecommendations(res.data.data.services || []);
        })
        .catch((err) => console.error('Error fetching recommendations:', err))
        .finally(() => setLoadingSeeker(false));
    }
  }, [user, isSeeker, isBoth]);

  useEffect(() => {
    if (user && (isProvider || isBoth)) {
      setLoadingProvider(true);
      api.get(`/services?providerId=${user.id}`)
        .then((res) => {
          setProviderListings(res.data.data.services || []);
        })
        .catch((err) => console.error('Error fetching provider listings:', err))
        .finally(() => setLoadingProvider(false));
    }
  }, [user, isProvider, isBoth]);

  const handleCardClick = (id) => {
    navigate(`/listing/${id}`);
  };

  const steps = [
    {
      num: '1',
      icon: UserCheck,
      title: 'Sign Up & Set Your Role',
      desc: 'Create your account in seconds. Choose whether you want to offer services, hire peers, or do both.',
      color: '#7C3AED'
    },
    {
      num: '2',
      icon: Search,
      title: 'Browse or List Your Services',
      desc: 'Seekers browse through 18 rich categories. Providers list their skills and set custom pricing.',
      color: '#FF4D6D'
    },
    {
      num: '3',
      icon: CalendarCheck,
      title: 'Connect, Book & Get Things Done',
      desc: 'Message directly, confirm booking slots, get tasks completed, and write verified peer reviews.',
      color: '#FFB800'
    }
  ];

  return (
    <div className="relative overflow-hidden w-full">
      {/* Floating Keyframe animations styled locally */}
      <style>{`
        @keyframes float-custom {
          0%, 100% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
          50% { transform: translateY(-12px) rotate(var(--rot, 0deg)); }
        }
        .animate-float-1 {
          --rot: -4deg;
          animation: float-custom 6s ease-in-out infinite;
        }
        .animate-float-2 {
          --rot: 4deg;
          animation: float-custom 7s ease-in-out infinite 1s;
        }
        .animate-float-3 {
          --rot: 0deg;
          animation: float-custom 5s ease-in-out infinite 0.5s;
        }
      `}</style>

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative w-full py-16 lg:py-28 bg-gradient-to-br from-[#1b0a3a] via-[#0D0A1E] to-[#50071c] text-white">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-80 h-80 sm:w-96 sm:h-96 bg-primary-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 sm:w-96 sm:h-96 bg-secondary-500/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column (Hero Content) */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-primary-200 border border-white/10 animate-fade-in">
                🎓 The Ultimate Campus Marketplace
              </span>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
                Every Service You Need.<br />
                <span className="bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-fill-color-transparent text-transparent">
                  Right On Campus.
                </span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-xl mx-auto lg:mx-0 font-medium">
                CampusConnect is the go-to marketplace where university students connect to trade skills, offer services, and support local peers.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link to="/services">
                  <Button variant="primary" size="lg" className="shadow-lg shadow-primary-500/35 w-full sm:w-auto font-bold flex items-center justify-center gap-2">
                    Find a Service <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to={user ? '/services/create' : '/register'}>
                  <Button variant="ghost" size="lg" className="w-full sm:w-auto text-white hover:bg-white/10 border border-white/20 font-bold">
                    Offer a Service
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column (Abstract Graphic) */}
            <div className="lg:col-span-5 relative hidden md:block">
              <div className="relative w-full h-[400px] flex items-center justify-center">
                {/* Rotating blur container */}
                <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-primary-500/20 to-secondary-500/20 blur-2xl animate-pulse" />
                
                {/* Card 1: Academic */}
                <div className="absolute top-8 left-4 w-52 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl animate-float-1">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center mb-3">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Academic</p>
                  <p className="text-sm text-white font-black truncate">Calculus II Exam Prep</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-white/60">By Sarah M.</span>
                    <span className="font-bold text-accent-400">$20/hr</span>
                  </div>
                </div>

                {/* Card 2: Food & Baking */}
                <div className="absolute bottom-8 right-4 w-56 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl animate-float-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-secondary-500 to-pink-500 flex items-center justify-center mb-3">
                    <UtensilsCrossed className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Food & Catering</p>
                  <p className="text-sm text-white font-black truncate">Fresh Late-Night Shawarma</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-white/60">By David K.</span>
                    <span className="font-bold text-green-400">$10/meal</span>
                  </div>
                </div>

                {/* Rating Overlay */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 p-3 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 shadow-xl animate-float-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-accent-400 flex items-center justify-center text-[10px] text-black font-bold">★</div>
                    <div className="text-xs text-white">
                      <span className="font-bold">4.9</span> (120+ reviews)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-sm font-bold text-primary-500 uppercase tracking-widest bg-primary-50 dark:bg-primary-950/20 px-3 py-1 rounded-full">
              Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3" style={{ color: 'var(--text-heading)' }}>
              How CampusConnect Works
            </h2>
            <p className="text-sm sm:text-base mt-3 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
              Get help or monetize your skillset in three simple steps.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8 stagger-children">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <ScrollReveal key={step.num} delay={idx * 150} className="h-full">
                <div className="surface p-6 sm:p-8 rounded-2xl relative h-full flex flex-col items-center text-center group border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-all">
                  {/* Huge background number */}
                  <span className="text-8xl font-black absolute top-2 right-4 opacity-5 select-none transition-opacity group-hover:opacity-10 dark:text-slate-100 text-slate-800">
                    {step.num}
                  </span>
                  
                  {/* Icon Container */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-md"
                    style={{
                      background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)`,
                      boxShadow: `0 8px 16px ${step.color}20`
                    }}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text-heading)' }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {step.desc}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* ==================== SERVICE CATEGORIES PREVIEW ==================== */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[var(--border-default)]">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-sm font-bold text-secondary-500 uppercase tracking-widest bg-secondary-50 dark:bg-secondary-950/20 px-3 py-1 rounded-full">
              Explore
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3" style={{ color: 'var(--text-heading)' }}>
              Service Categories
            </h2>
            <p className="text-sm sm:text-base mt-3 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
              Find peer services spanning 18 distinct categories, tailored for university life.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, idx) => {
            const Icon = getCategoryIcon(cat.icon);
            return (
              <ScrollReveal key={cat.id} delay={Math.min(idx * 50, 400)}>
                <ServiceCategoryCard
                  icon={Icon}
                  name={cat.name}
                  description={cat.description}
                  color={cat.color}
                  isVirtual={cat.isVirtualEligible}
                  onClick={() => navigate(`/services?category=${cat.id}`)}
                />
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal>
          <div className="flex justify-center mt-12">
            <Link to="/services">
              <Button variant="secondary" size="lg" className="font-bold flex items-center gap-2">
                Browse All Services <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* ==================== ROLE-BASED DYNAMIC SECTIONS ==================== */}
      <section className="py-20 bg-[var(--bg-surface-raised)] border-t border-b border-[var(--border-default)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Guest User: Popular Services */}
          {isGuest && (
            <ScrollReveal>
              <div className="mb-10 text-center md:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-heading)' }}>
                  Popular Services
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  Trending listings booked by students across campus.
                </p>
              </div>

              {loadingPopular ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} variant="listing" />
                  ))}
                </div>
              ) : popularListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {popularListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      image={listing.imageUrl}
                      title={listing.title}
                      description={listing.description}
                      category={listing.category}
                      price={listing.price}
                      pricingType={listing.pricingType}
                      rating={listing.avgRating}
                      reviewCount={listing._count?.reviews || 0}
                      provider={listing.provider}
                      actionLabel="View Listing"
                      onClick={() => handleCardClick(listing.id)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Briefcase}
                  title="No listings found"
                  description="Be the first to offer a service at your university!"
                  actionLabel="Create a Listing"
                  onAction={() => navigate('/services/create')}
                />
              )}
            </ScrollReveal>
          )}

          {/* Logged in Seeker or Provider or Both */}
          {user && (
            <div className="space-y-16">
              
              {/* Stack 1: Active Listings (if Provider or Both) */}
              {(isProvider || isBoth) && (
                <ScrollReveal>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="text-center sm:text-left">
                      <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-heading)' }}>
                        Your Active Listings
                      </h2>
                      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        Manage the services you are currently offering to peers.
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      className="font-bold flex items-center justify-center gap-1.5 self-center sm:self-auto"
                      onClick={() => navigate('/services/create')}
                    >
                      <Plus className="w-4.5 h-4.5" /> Add New Listing
                    </Button>
                  </div>

                  {loadingProvider ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} variant="listing" />
                      ))}
                    </div>
                  ) : providerListings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {providerListings.map((listing) => (
                        <ListingCard
                          key={listing.id}
                          image={listing.imageUrl}
                          title={listing.title}
                          description={listing.description}
                          category={listing.category}
                          price={listing.price}
                          pricingType={listing.pricingType}
                          rating={listing.avgRating}
                          reviewCount={listing._count?.reviews || 0}
                          provider={listing.provider}
                          actionLabel="View Listing"
                          onClick={() => handleCardClick(listing.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Briefcase}
                      title="You haven't listed any services yet"
                      description="Monetize your campus skills! Put up a tutoring session, delivery gig, or artwork listing."
                      actionLabel="Create Your First Listing"
                      onAction={() => navigate('/services/create')}
                    />
                  )}
                </ScrollReveal>
              )}

              {/* Stack 2: Recommended For You (if Seeker or Both) */}
              {(isSeeker || isBoth) && (
                <ScrollReveal>
                  <div className="mb-8 text-center sm:text-left">
                    <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-heading)' }}>
                      Recommended For You
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                      Services matching the interest categories you selected during onboarding.
                    </p>
                  </div>

                  {loadingSeeker ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} variant="listing" />
                      ))}
                    </div>
                  ) : seekerRecommendations.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {seekerRecommendations.map((listing) => (
                        <ListingCard
                          key={listing.id}
                          image={listing.imageUrl}
                          title={listing.title}
                          description={listing.description}
                          category={listing.category}
                          price={listing.price}
                          pricingType={listing.pricingType}
                          rating={listing.avgRating}
                          reviewCount={listing._count?.reviews || 0}
                          provider={listing.provider}
                          actionLabel="Book Now"
                          onClick={() => handleCardClick(listing.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="surface p-8 rounded-2xl text-center">
                      <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                        No recommendations found in your categories. Add more interests to see customized deals!
                      </p>
                      <Link to="/profile">
                        <Button variant="ghost" size="sm">Update My Interests</Button>
                      </Link>
                    </div>
                  )}
                </ScrollReveal>
              )}

            </div>
          )}

        </div>
      </section>

      {/* ==================== BOTTOM CALL TO ACTION ==================== */}
      {!user && (
        <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center py-12 px-6 sm:px-12 gradient-border rounded-3xl bg-[var(--bg-surface)] shadow-2xl relative overflow-hidden">
              {/* Background gradient overlays */}
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary-500/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-secondary-500/10 rounded-full blur-2xl" />

              <h2 className="text-3xl sm:text-4xl font-black mb-4 bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-fill-color-transparent text-transparent">
                Ready to Join CampusConnect?
              </h2>
              <p className="text-sm sm:text-base max-w-md mx-auto mb-8" style={{ color: 'var(--text-muted)' }}>
                Become part of your university's official student service network today. Sign up and kickstart your campus gig.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full font-bold">
                    Create Your Account
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="ghost" size="lg" className="w-full text-primary-500 font-bold hover:bg-primary-50">
                    Log In
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </section>
      )}
    </div>
  );
}
