import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  Pencil,
  Trash2,
  Star,
  BookOpen,
  MessageSquare,
  Award,
  X,
  PenLine,
  DollarSign,
  Image,
  ChevronLeft,
  Briefcase,
  Layers,
  Play,
  Pause,
  Mail,
  Phone
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ListingCard from '../components/ui/ListingCard';
import { CATEGORIES } from '../data/categories';
import { getCategoryIcon } from '../lib/categoryIcons';

export default function BrowseServices() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Roles checking
  const isProviderOnly = user?.activeRoles?.includes('PROVIDER') && !user?.activeRoles?.includes('SEEKER');
  const isSeekerOnly = user?.activeRoles?.includes('SEEKER') && !user?.activeRoles?.includes('PROVIDER');
  const isBoth = user?.activeRoles?.includes('SEEKER') && user?.activeRoles?.includes('PROVIDER');
  const isProvider = isProviderOnly || isBoth;

  // Active tab state for SEEKER + PROVIDER
  const [activeTab, setActiveTab] = useState(() => {
    if (isBoth) {
      return localStorage.getItem('browseActiveTab') || 'seeker';
    }
    return isProviderOnly ? 'provider' : 'seeker';
  });

  // Remember active tab
  useEffect(() => {
    if (isBoth) {
      localStorage.setItem('browseActiveTab', activeTab);
    }
  }, [activeTab, isBoth]);

  // Seeker State 1 — Category Selected & Provider lists
  const [activeCategory, setActiveCategory] = useState(() => {
    return searchParams.get('category') || CATEGORIES[0]?.id;
  });
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);

  // Seeker State 2 — Provider Selected
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [loadingSelectedProvider, setLoadingSelectedProvider] = useState(false);

  // Provider View State — Own Listings
  const [providerListings, setProviderListings] = useState([]);
  const [loadingProviderListings, setLoadingProviderListings] = useState(false);

  // Edit Service Modal State
  const [editingService, setEditingService] = useState(null);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    pricingType: 'FIXED',
    imageUrl: '',
    isActive: true,
  });

  // Contact Modal State
  const [contactProvider, setContactProvider] = useState(null);

  // Synchronize category param in URL
  useEffect(() => {
    if (activeCategory) {
      setSearchParams({ category: activeCategory });
    }
  }, [activeCategory, setSearchParams]);

  // Fetch Providers list for Seeker Category Select
  const fetchProviders = async () => {
    if (activeTab !== 'seeker') return;
    setLoadingProviders(true);
    try {
      const { data } = await api.get(`/users/providers?category=${activeCategory}&search=${search}`);
      setProviders(data.data || []);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: 'Failed to load providers' });
    } finally {
      setLoadingProviders(false);
    }
  };

  useEffect(() => {
    fetchProviders();
    // Clear provider selection when category changes
    setSelectedProvider(null);
  }, [activeCategory, activeTab]);

  // Fetch Provider's Own Listings
  const fetchProviderListings = async () => {
    if (activeTab !== 'provider') return;
    setLoadingProviderListings(true);
    try {
      const { data } = await api.get(`/services?providerId=${user?.id}&includeInactive=true`);
      setProviderListings(data.data.services || []);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: 'Failed to load your listings' });
    } finally {
      setLoadingProviderListings(false);
    }
  };

  useEffect(() => {
    if (user && activeTab === 'provider') {
      fetchProviderListings();
    }
  }, [user, activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProviders();
  };

  // Seeker Selects Provider
  const handleProviderSelect = async (provider) => {
    setLoadingSelectedProvider(true);
    try {
      const { data } = await api.get(`/users/${provider.id}`);
      setSelectedProvider(data.data);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: 'Failed to load provider profile' });
    } finally {
      setLoadingSelectedProvider(false);
    }
  };

  const handleCardClick = (id) => {
    navigate(`/listing/${id}`);
  };

  // Provider Toggles Active Status of Listing
  const handleToggleActive = async (serviceId, currentActive) => {
    try {
      await api.put(`/services/${serviceId}`, { isActive: !currentActive });
      setProviderListings((prev) =>
        prev.map((s) => (s.id === serviceId ? { ...s, isActive: !currentActive } : s))
      );
      addToast({
        type: 'success',
        message: `Listing ${!currentActive ? 'activated' : 'paused'} successfully`,
      });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: 'Failed to update listing status' });
    }
  };

  // Provider Deletes Service
  const handleDeleteService = async (serviceId) => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;
    try {
      await api.delete(`/services/${serviceId}`);
      setProviderListings((prev) => prev.filter((s) => s.id !== serviceId));
      addToast({ type: 'success', message: 'Listing deleted successfully' });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: 'Failed to delete listing' });
    }
  };

  // Provider Edit Modal Setup
  const openEditModal = (service) => {
    setEditingService(service);
    setEditForm({
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price.toString(),
      pricingType: service.pricingType,
      imageUrl: service.imageUrl || '',
      isActive: service.isActive,
    });
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmittingEdit(true);
    try {
      const { data } = await api.put(`/services/${editingService.id}`, {
        ...editForm,
        price: parseFloat(editForm.price) || 0,
        imageUrl: editForm.imageUrl || undefined,
      });

      // Update provider listing list in state
      setProviderListings((prev) =>
        prev.map((s) => (s.id === editingService.id ? { ...s, ...data.data } : s))
      );
      addToast({ type: 'success', message: 'Listing updated successfully' });
      setEditingService(null);
    } catch (err) {
      console.error(err);
      addToast({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update listing',
      });
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Similar Providers for Selected Provider
  const similarProviders = providers.filter(
    (p) => p.id !== selectedProvider?.id
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[80vh]">
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black" style={{ color: 'var(--text-heading)' }}>
            {activeTab === 'seeker' ? 'Browse Services' : 'My Listings Board'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {activeTab === 'seeker'
              ? 'Find specialized campus help offered by fellow university peers.'
              : 'Add, update, and manage your campus service listings.'}
          </p>
        </div>

        {/* Tab switcher for BOTH roles */}
        {isBoth && (
          <div className="flex bg-[var(--bg-surface-raised)] border border-[var(--border-default)] p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => {
                setActiveTab('seeker');
                setSelectedProvider(null);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'seeker'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
              }`}
            >
              Find Services
            </button>
            <button
              onClick={() => setActiveTab('provider')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'provider'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
              }`}
            >
              My Listings
            </button>
          </div>
        )}

        {/* Create button on right for Providers */}
        {activeTab === 'provider' && (
          <Link to="/services/create" className="self-start sm:self-auto">
            <Button variant="primary" size="md" className="font-bold flex items-center gap-1.5">
              <PlusCircle className="w-5 h-5" /> Create New Listing
            </Button>
          </Link>
        )}
      </div>

      {/* Main Two-Panel Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start relative">
        
        {/* ==================== LEFT PANEL (25%): Category List ==================== */}
        {activeTab === 'seeker' && (
          <aside className="w-full lg:w-1/4 lg:sticky lg:top-24 h-auto lg:h-[calc(100vh-140px)] overflow-y-auto pr-2 border-b lg:border-b-0 lg:border-r border-[var(--border-default)] pb-4 lg:pb-0 scrollbar-hide flex-shrink-0">
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 scrollbar-hide whitespace-nowrap lg:whitespace-normal">
              {CATEGORIES.map((cat) => {
                const Icon = getCategoryIcon(cat.icon);
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setSelectedProvider(null);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all cursor-pointer w-full whitespace-nowrap lg:whitespace-normal ${
                      isActive
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                        : 'surface border border-[var(--border-default)] text-[var(--text-body)] hover:bg-[var(--bg-muted)]'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* ==================== RIGHT PANEL (75% / 100%): Content View ==================== */}
        <main
          className={`w-full ${activeTab === 'seeker' ? 'lg:w-3/4' : 'w-full'}`}
        >
          {/* Key forces component refresh and triggers animate-fade-in CSS animation */}
          <div
            key={`${activeTab}-${activeCategory}-${selectedProvider?.id}`}
            className="animate-fade-in space-y-8"
          >
            {/* SEEKER VIEW RENDER */}
            {activeTab === 'seeker' && (
              <>
                {/* STATE 1: Category Selected (Show providers list) */}
                {!selectedProvider && (
                  <div className="space-y-6">
                    {/* Search Bar */}
                    <form onSubmit={handleSearchSubmit} className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-faint)]" />
                        <input
                          type="text"
                          placeholder="Search providers by name..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-body)] placeholder-[var(--text-faint)] focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm font-medium"
                        />
                      </div>
                      <Button type="submit" variant="primary" className="font-bold">
                        Search
                      </Button>
                    </form>

                    {/* Providers list */}
                    {loadingProviders ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} variant="card" />
                        ))}
                      </div>
                    ) : providers.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {providers.map((provider) => (
                          <div
                            key={provider.id}
                            className="surface rounded-2xl p-5 border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-all flex flex-col justify-between h-full hover:shadow-lg"
                          >
                            <div>
                              <div className="flex items-center gap-3 mb-4">
                                <Avatar
                                  src={provider.avatarUrl}
                                  name={`${provider.firstName} ${provider.lastName}`}
                                  size="lg"
                                />
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-base text-[var(--text-heading)] truncate">
                                    {provider.firstName} {provider.lastName}
                                  </h3>
                                  <p className="text-xs text-[var(--text-muted)] truncate">
                                    {provider.university || 'Campus Student'}
                                  </p>
                                </div>
                              </div>

                              {/* Rating and Completed Count */}
                              <div className="flex items-center gap-4 mb-4 text-xs font-semibold text-[var(--text-muted)]">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-accent-400 fill-accent-400" />
                                  <span className="text-[var(--text-heading)]">
                                    {provider.avgRating > 0
                                      ? provider.avgRating.toFixed(1)
                                      : 'No reviews'}
                                  </span>
                                </div>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                                <div>
                                  <span className="text-[var(--text-heading)]">
                                    {provider.completedCount}
                                  </span>{' '}
                                  completed bookings
                                </div>
                              </div>
                            </div>

                            {/* Top Listing Snippet */}
                            {provider.topListing ? (
                              <div className="mt-2 p-3 bg-[var(--bg-base)] rounded-xl border border-[var(--border-default)]">
                                <p className="text-[9px] uppercase font-black text-primary-500 tracking-wider mb-1">
                                  Top Listing
                                </p>
                                <h4 className="text-sm font-bold text-[var(--text-heading)] line-clamp-1 mb-1">
                                  {provider.topListing.title}
                                </h4>
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-[var(--text-muted)]">Price</span>
                                  <span className="font-bold text-[var(--text-heading)]">
                                    ${Number(provider.topListing.price).toFixed(0)}
                                    {provider.topListing.pricingType === 'HOURLY' ? '/hr' : ''}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-2 p-3 bg-[var(--bg-base)] rounded-xl border border-dashed border-[var(--border-default)] text-center">
                                <p className="text-xs text-[var(--text-muted)] italic">
                                  No active listings yet
                                </p>
                              </div>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-5 w-full font-bold justify-center border border-[var(--border-default)] hover:border-[var(--border-strong)]"
                              onClick={() => handleProviderSelect(provider)}
                            >
                              View Profile
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={Briefcase}
                        title="No providers found"
                        description="Try checking another category or refining your search term."
                      />
                    )}
                  </div>
                )}

                {/* STATE 2: Provider Selected (Show profile and listings) */}
                {selectedProvider && (
                  <div className="space-y-8">
                    {/* Back Button */}
                    <button
                      onClick={() => setSelectedProvider(null)}
                      className="inline-flex items-center gap-1 text-sm font-bold text-primary-500 hover:text-primary-600 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" /> Back to category listings
                    </button>

                    {/* Provider Banner Profile card */}
                    {loadingSelectedProvider ? (
                      <Skeleton variant="card" />
                    ) : (
                      <div className="surface p-6 sm:p-8 rounded-2xl border border-[var(--border-default)] relative overflow-hidden">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                          <Avatar
                            src={selectedProvider.avatarUrl}
                            name={`${selectedProvider.firstName} ${selectedProvider.lastName}`}
                            className="w-20 h-20 sm:w-24 sm:h-24 shadow-md border-2 border-primary-500/20"
                          />
                          <div className="flex-1 text-center md:text-left space-y-3">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div>
                                <h2 className="text-2xl font-black text-[var(--text-heading)]">
                                  {selectedProvider.firstName} {selectedProvider.lastName}
                                </h2>
                                <p className="text-sm font-semibold text-primary-500 mt-0.5">
                                  {selectedProvider.university || 'Campus student provider'}
                                </p>
                              </div>

                              {/* Message CTA next to name */}
                              <Button
                                variant="secondary"
                                size="sm"
                                className="font-bold flex items-center justify-center gap-1.5 self-center md:self-auto"
                                onClick={() => navigate(`/messages?providerId=${selectedProvider.id}`)}
                              >
                                <MessageSquare className="w-4 h-4" /> Message
                              </Button>
                            </div>

                            {selectedProvider.bio && (
                              <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-2xl">
                                {selectedProvider.bio}
                              </p>
                            )}

                            {/* Verification / Stats pills */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-[var(--text-body)]">
                                <Award className="w-3.5 h-3.5 text-secondary-500" />
                                {selectedProvider.services?.length || 0} active listings
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-[var(--text-body)]">
                                <Star className="w-3.5 h-3.5 text-accent-500 fill-accent-500" />
                                {selectedProvider.phone ? 'Phone verified' : 'Email verified'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Active Listings Section */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
                        Active Listings
                      </h3>
                      {selectedProvider.services && selectedProvider.services.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {selectedProvider.services.map((listing) => (
                            <ListingCard
                              key={listing.id}
                              image={listing.imageUrl}
                              title={listing.title}
                              description={listing.description}
                              category={listing.category}
                              price={listing.price}
                              pricingType={listing.pricingType}
                              rating={listing.avgRating || 0}
                              reviewCount={listing._count?.reviews || 0}
                              provider={selectedProvider}
                              actionLabel="Book Now"
                              onClick={() => handleCardClick(listing.id)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="surface p-8 rounded-2xl text-center border border-dashed border-[var(--border-default)]">
                          <p className="text-sm text-[var(--text-muted)] mb-4 leading-relaxed">
                            No active listings yet — reach out via the message function.
                          </p>
                          <Button
                            variant="primary"
                            size="md"
                            className="font-bold flex items-center justify-center gap-1.5 mx-auto"
                            onClick={() => navigate(`/messages?providerId=${selectedProvider.id}`)}
                          >
                            <MessageSquare className="w-4.5 h-4.5" /> Message Provider
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Similar Providers Section */}
                    <div className="space-y-4 pt-6 border-t border-[var(--border-default)]">
                      <h3 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
                        Similar Providers
                      </h3>
                      {similarProviders.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {similarProviders.slice(0, 3).map((provider) => (
                            <div
                              key={provider.id}
                              className="surface rounded-2xl p-5 border border-[var(--border-default)] flex flex-col justify-between h-full hover:shadow-lg transition-all"
                            >
                              <div className="flex items-center gap-3 mb-4">
                                <Avatar
                                  src={provider.avatarUrl}
                                  name={`${provider.firstName} ${provider.lastName}`}
                                  size="md"
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-sm text-[var(--text-heading)] truncate">
                                    {provider.firstName} {provider.lastName}
                                  </h4>
                                  <p className="text-[10px] text-[var(--text-muted)] truncate">
                                    {provider.university || 'Campus Student'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex justify-between items-center text-xs font-semibold text-[var(--text-muted)]">
                                <span>{provider.completedCount} bookings</span>
                                <div className="flex items-center gap-0.5">
                                  <Star className="w-3.5 h-3.5 text-accent-400 fill-accent-400" />
                                  <span className="text-[var(--text-heading)]">
                                    {provider.avgRating > 0 ? provider.avgRating.toFixed(1) : '0.0'}
                                  </span>
                                </div>
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-4 w-full justify-center text-xs font-bold border border-[var(--border-default)]"
                                onClick={() => {
                                  handleProviderSelect(provider);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                              >
                                View Profile
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[var(--text-muted)] italic">
                          No other providers found in this category.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* PROVIDER VIEW RENDER */}
            {activeTab === 'provider' && (
              <div className="space-y-6">
                {loadingProviderListings ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} variant="listing" />
                    ))}
                  </div>
                ) : providerListings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {providerListings.map((listing) => {
                      const catInfo = CATEGORIES.find((c) => c.id === listing.category);
                      return (
                        <div
                          key={listing.id}
                          className="surface rounded-2xl p-5 border border-[var(--border-default)] hover:shadow-lg transition-all flex flex-col justify-between"
                        >
                          <div>
                            {/* Header Status & Category */}
                            <div className="flex items-center justify-between mb-3">
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{
                                  color: catInfo ? catInfo.color : 'var(--color-primary-500)',
                                  backgroundColor: catInfo ? `${catInfo.color}15` : 'var(--color-primary-500)15',
                                }}
                              >
                                {catInfo ? catInfo.name : listing.category}
                              </span>

                              {/* Status Badge */}
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  listing.isActive
                                    ? 'bg-success-100 text-success-700 dark:bg-success-950/30 dark:text-success-300'
                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                              >
                                {listing.isActive ? 'Active' : 'Paused'}
                              </span>
                            </div>

                            <h3 className="font-bold text-lg text-[var(--text-heading)] truncate mb-1">
                              {listing.title}
                            </h3>
                            <p className="text-sm font-semibold text-[var(--text-heading)] mb-4">
                              ${Number(listing.price).toFixed(0)}
                              <span className="text-xs text-[var(--text-muted)] font-normal">
                                {listing.pricingType === 'HOURLY' ? ' / hour' : ' (Fixed)'}
                              </span>
                            </p>
                          </div>

                          {/* Footer Stats & Actions */}
                          <div className="pt-4 border-t border-[var(--border-default)] flex items-center justify-between gap-4">
                            <div className="text-xs font-semibold text-[var(--text-muted)]">
                              Received{' '}
                              <span className="text-[var(--text-heading)]">
                                {listing._count?.bookings || 0}
                              </span>{' '}
                              bookings
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center gap-2">
                              {/* Toggle active switch */}
                              <button
                                onClick={() => handleToggleActive(listing.id, listing.isActive)}
                                className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                                  listing.isActive
                                    ? 'hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)] border-[var(--border-default)]'
                                    : 'bg-primary-500/10 text-primary-500 border-primary-500/20 hover:bg-primary-500/20'
                                }`}
                                title={listing.isActive ? 'Pause listing' : 'Activate listing'}
                              >
                                {listing.isActive ? (
                                  <Pause className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                              </button>

                              <button
                                onClick={() => openEditModal(listing)}
                                className="p-2 rounded-xl border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Edit listing"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteService(listing.id)}
                                className="p-2 rounded-xl border border-red-200 dark:border-red-950/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 transition-colors cursor-pointer"
                                title="Delete listing"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    icon={Briefcase}
                    title="No service listings yet"
                    description="Put up your first skills card to start getting bookings from seekers!"
                    actionLabel="Create Your First Listing"
                    onAction={() => navigate('/services/create')}
                  />
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ==================== INLINE EDIT MODAL ==================== */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-3xl p-6 sm:p-8 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setEditingService(null)}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-[var(--bg-muted)] text-[var(--text-muted)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black mb-1" style={{ color: 'var(--text-heading)' }}>
              Edit Listing
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-6">
              Modify your listing details below and hit publish.
            </p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[var(--text-body)]">Title</label>
                <div className="relative">
                  <PenLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-[var(--bg-muted)] border border-[var(--border-default)] text-[var(--text-body)] placeholder-[var(--text-faint)] focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[var(--text-body)]">Description</label>
                <textarea
                  required
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-[var(--bg-muted)] border border-[var(--border-default)] text-[var(--text-body)] placeholder-[var(--text-faint)] focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all font-medium resize-none"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[var(--text-body)]">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-[var(--bg-muted)] border border-[var(--border-default)] text-[var(--text-body)] focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all font-medium"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-slate-900">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price & Pricing Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[var(--text-body)]">Price ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-[var(--bg-muted)] border border-[var(--border-default)] text-[var(--text-body)] focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[var(--text-body)]">Pricing Type</label>
                  <select
                    value={editForm.pricingType}
                    onChange={(e) => setEditForm({ ...editForm, pricingType: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-[var(--bg-muted)] border border-[var(--border-default)] text-[var(--text-body)] focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all font-medium"
                  >
                    <option value="FIXED" className="bg-slate-900">
                      Fixed Price
                    </option>
                    <option value="HOURLY" className="bg-slate-900">
                      Per Hour
                    </option>
                    <option value="FREE" className="bg-slate-900">
                      Free
                    </option>
                  </select>
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[var(--text-body)]">Image URL (Optional)</label>
                <div className="relative">
                  <Image className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
                  <input
                    type="text"
                    value={editForm.imageUrl}
                    onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-[var(--bg-muted)] border border-[var(--border-default)] text-[var(--text-body)] placeholder-[var(--text-faint)] focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Status active switch */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  className="rounded border-[var(--border-default)] text-primary-500 focus:ring-primary-500/20 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-[var(--text-body)] cursor-pointer">
                  List as Active (Visible to Seekers)
                </label>
              </div>

              {/* Submit CTAs */}
              <div className="flex gap-3 pt-4 border-t border-[var(--border-default)] justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  className="border border-[var(--border-default)]"
                  onClick={() => setEditingService(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={submittingEdit}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}
