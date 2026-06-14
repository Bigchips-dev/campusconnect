import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft, Star, CheckCircle2, XCircle, MessageSquare,
  Calendar, Award, ArrowRight,
} from 'lucide-react';
import api from '../../lib/api';
import { CATEGORIES } from '../../data/categories';
import { getCategoryIcon } from '../../lib/categoryIcons';

/* ─── CSS ────────────────────────────────────────────────────────────────── */
const GLOBAL_STYLE = `
  @keyframes cc-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
  .cc-shimmer { background:#F3F4F6; animation: cc-pulse 1.6s ease-in-out infinite; border-radius:8px; }
  .sim-scroll { display:flex; gap:16px; overflow-x:auto; padding-bottom:8px; }
  .sim-scroll::-webkit-scrollbar { height:4px; }
  .sim-scroll::-webkit-scrollbar-thumb { background:#E5E7EB; border-radius:4px; }
  @media (max-width:640px) { .listing-grid { grid-template-columns:1fr !important; } }
`;

const PALETTE = ['#7C3AED','#EF4444','#10B981','#F59E0B','#0EA5E9','#EC4899','#F97316'];
function avatarBg(name = '') {
  const h = name.split('').reduce((acc, c) => c.charCodeAt(0) + ((acc << 5) - acc), 0);
  return PALETTE[Math.abs(h) % PALETTE.length];
}
function initials(name = '') {
  return name.split(' ').filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
}
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function ProviderProfile() {
  const { providerId } = useParams();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similarProviders, setSimilarProviders] = useState([]);
  const [activeTab, setActiveTab] = useState('listings');

  // Fetch provider details — uses existing API /users/:id
  useEffect(() => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    api.get(`/users/${providerId}`)
      .then(({ data }) => {
        const p = data.data;
        setProvider(p);
        // Fetch similar providers based on provider's first skill category
        const firstCat = p.skills?.[0]?.category;
        if (firstCat) {
          api.get(`/users/providers?category=${firstCat}`)
            .then(({ data: d }) => {
              const others = (d.data || [])
                .filter((x) => x.id !== providerId)
                .sort((a, b) => {
                  const dc = (b.completedCount || 0) - (a.completedCount || 0);
                  return dc !== 0 ? dc : (b.avgRating || 0) - (a.avgRating || 0);
                })
                .slice(0, 8);
              setSimilarProviders(others);
            })
            .catch(() => {});
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [providerId]);

  // Aggregate all reviews from the provider's services
  const allReviews = (provider?.services || []).flatMap((s) =>
    (s.reviews || []).map((r) => ({ ...r, serviceTitle: s.title }))
  );

  const activeListings = (provider?.services || []).filter((s) => s.isActive !== false);
  const fullName = provider ? `${provider.firstName || ''} ${provider.lastName || ''}`.trim() : '';

  if (loading) return <ProfileSkeleton />;
  if (!provider) {
    return (
      <div style={{ padding: 48, textAlign: 'center', fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif" }}>
        <p style={{ color: '#6B7280', fontWeight: 600 }}>Provider not found.</p>
        <button onClick={() => navigate(-1)} style={{ marginTop: 12, color: '#F59E0B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>← Go back</button>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <style>{GLOBAL_STYLE}</style>

      {/* ── Back button ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 24px 0' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 600, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#0A0A0A')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
        >
          <ChevronLeft size={17} /> Back
        </button>
      </div>

      {/* ── Amber banner ── */}
      <div style={{ width: '100%', height: 100, background: '#F59E0B', position: 'relative', marginTop: 16 }} />

      {/* ── Profile header ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
        {/* Avatar overlapping banner */}
        <div style={{ marginTop: -52, marginBottom: 16 }}>
          {provider.avatarUrl ? (
            <img
              src={provider.avatarUrl}
              alt={fullName}
              style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 4px 16px rgba(0,0,0,.12)' }}
            />
          ) : (
            <div style={{
              width: 96, height: 96, borderRadius: '50%', background: avatarBg(fullName),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '1.75rem',
              border: '4px solid #fff', boxShadow: '0 4px 16px rgba(0,0,0,.12)',
            }}>
              {initials(fullName)}
            </div>
          )}
        </div>

        {/* Name + badges + message */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 8 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {fullName}
              </h1>
              {provider.emailVerified !== false ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600, color: '#10B981', background: '#ECFDF5', padding: '3px 10px', borderRadius: 9999 }}>
                  <CheckCircle2 size={13} /> Verified
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF', background: '#F9FAFB', padding: '3px 10px', borderRadius: 9999 }}>
                  <XCircle size={13} /> Unverified
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.9375rem', color: '#6B7280', marginTop: 4 }}>
              {[provider.faculty, provider.level].filter(Boolean).join(' · ') || provider.university || 'Campus Student'}
            </p>
          </div>

          <button
            onClick={() => navigate(`/messages?providerId=${provider.id}`)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px',
              background: '#0A0A0A', color: '#fff', fontWeight: 700, fontSize: '0.9375rem',
              border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background .18s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F59E0B')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#0A0A0A')}
          >
            <MessageSquare size={16} /> Message
          </button>
        </div>

        {/* Bio */}
        {provider.bio && (
          <p style={{ fontSize: '0.9375rem', color: '#4B5563', lineHeight: 1.7, maxWidth: 640, marginBottom: 24 }}>
            {provider.bio}
          </p>
        )}

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 0, border: '1.5px solid #E5E7EB', borderRadius: 14, overflow: 'hidden', marginBottom: 36 }}>
          {[
            { label: 'Completed', value: provider.completedCount || 0, accent: true },
            { label: 'Avg Rating', value: provider.avgRating > 0 ? `${Number(provider.avgRating).toFixed(1)} ★` : 'No reviews' },
            { label: 'Member Since', value: fmtDate(provider.createdAt) },
          ].map((stat, i) => (
            <div key={i} style={{
              flex: 1, padding: '18px 0', textAlign: 'center',
              borderRight: i < 2 ? '1px solid #E5E7EB' : 'none',
            }}>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, color: stat.accent ? '#F59E0B' : '#0A0A0A', marginBottom: 4 }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#6B7280' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1.5px solid #E5E7EB', marginBottom: 32 }}>
          {['listings', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 24px', fontSize: '0.9375rem', fontWeight: 700, cursor: 'pointer',
                background: 'none', border: 'none', fontFamily: 'inherit',
                color: activeTab === tab ? '#0A0A0A' : '#9CA3AF',
                borderBottom: activeTab === tab ? '2.5px solid #F59E0B' : '2.5px solid transparent',
                marginBottom: '-1.5px', transition: 'color .15s',
                textTransform: 'capitalize',
              }}
            >
              {tab === 'listings' ? `Listings (${activeListings.length})` : `Reviews (${allReviews.length})`}
            </button>
          ))}
        </div>

        {/* ── Listings tab ── */}
        {activeTab === 'listings' && (
          activeListings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', border: '1.5px dashed #E5E7EB', borderRadius: 14, color: '#9CA3AF' }}>
              <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>No active listings yet</p>
              <p style={{ fontSize: '0.875rem', marginTop: 4 }}>Reach out via the message button above</p>
            </div>
          ) : (
            <div className="listing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20, marginBottom: 48 }}>
              {activeListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onClick={() => navigate(`/listing/${listing.id}`)}
                />
              ))}
            </div>
          )
        )}

        {/* ── Reviews tab ── */}
        {activeTab === 'reviews' && (
          allReviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', border: '1.5px dashed #E5E7EB', borderRadius: 14, color: '#9CA3AF', marginBottom: 48 }}>
              <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>No reviews yet</p>
              <p style={{ fontSize: '0.875rem', marginTop: 4 }}>Be the first to leave a review after booking</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 48 }}>
              {allReviews.map((review, i) => (
                <ReviewCard key={i} review={review} />
              ))}
            </div>
          )
        )}

        {/* ── Similar Providers ── */}
        {similarProviders.length > 0 && (
          <div style={{ paddingTop: 40, borderTop: '1.5px solid #E5E7EB', marginBottom: 48 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0A0A0A', marginBottom: 20 }}>
              Similar Providers
            </h3>
            <div className="sim-scroll">
              {similarProviders.map((p) => (
                <MiniProviderCard
                  key={p.id}
                  provider={p}
                  onClick={() => navigate(`/provider/${p.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Listing card ──────────────────────────────────────────────────────── */
function ListingCard({ listing, onClick }) {
  const [hovered, setHovered] = useState(false);
  const catInfo = CATEGORIES.find((c) => c.id === listing.category);
  const priceLabel =
    listing.pricingType === 'FREE' ? 'Free' :
    `₦${Number(listing.price).toLocaleString()}${listing.pricingType === 'HOURLY' ? '/hr' : ''}`;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '20px', background: '#fff',
        border: `1.5px solid ${hovered ? '#F59E0B' : '#E5E7EB'}`, borderRadius: 14,
        cursor: 'pointer', transition: 'all .18s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,.09)' : '0 1px 3px rgba(0,0,0,.04)',
      }}
    >
      {/* Category pill */}
      {catInfo && (
        <span style={{
          display: 'inline-block', fontSize: '0.75rem', fontWeight: 700, marginBottom: 10,
          padding: '3px 10px', borderRadius: 9999,
          color: catInfo.color, background: `${catInfo.color}18`,
        }}>
          {catInfo.name}
        </span>
      )}

      {/* Title */}
      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0A0A0A', marginBottom: 6, lineHeight: 1.35 }}>
        {listing.title}
      </h4>

      {/* Description */}
      {listing.description && (
        <p style={{ fontSize: '0.875rem', color: '#6B7280', lineHeight: 1.55, marginBottom: 14,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {listing.description}
        </p>
      )}

      {/* Price + Book Now */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <span style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#F59E0B' }}>{priceLabel}</span>
        <button
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '7px 14px', borderRadius: 8,
            background: '#F59E0B', color: '#0A0A0A',
            fontWeight: 700, fontSize: '0.8125rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Book Now <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

/* ─── Review card ───────────────────────────────────────────────────────── */
function ReviewCard({ review }) {
  const reviewerName = review.reviewer
    ? `${review.reviewer.firstName || ''} ${review.reviewer.lastName || ''}`.trim()
    : 'Anonymous';
  const bg = avatarBg(reviewerName);

  return (
    <div style={{ padding: '20px', border: '1.5px solid #E5E7EB', borderRadius: 14, background: '#FAFAFA' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        {/* Avatar */}
        {review.reviewer?.avatarUrl ? (
          <img src={review.reviewer.avatarUrl} alt={reviewerName}
            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{
            width: 40, height: 40, borderRadius: '50%', background: bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
          }}>
            {initials(reviewerName)}
          </div>
        )}

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0A0A0A' }}>{reviewerName}</span>
            <span style={{ fontSize: '0.8125rem', color: '#9CA3AF' }}>{fmtDate(review.createdAt)}</span>
          </div>
          {/* Stars */}
          <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={13} style={{ color: i < (review.rating || 0) ? '#F59E0B' : '#E5E7EB', fill: i < (review.rating || 0) ? '#F59E0B' : '#E5E7EB' }} />
            ))}
          </div>
        </div>
      </div>

      {review.comment && (
        <p style={{ fontSize: '0.9375rem', color: '#374151', lineHeight: 1.65 }}>{review.comment}</p>
      )}
      {review.serviceTitle && (
        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 10 }}>
          For: <span style={{ fontWeight: 600 }}>{review.serviceTitle}</span>
        </p>
      )}
    </div>
  );
}

/* ─── Mini provider card for Similar Providers row ──────────────────────── */
function MiniProviderCard({ provider, onClick }) {
  const [hovered, setHovered] = useState(false);
  const name = `${provider.firstName || ''} ${provider.lastName || ''}`.trim();

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flexShrink: 0, width: 200, padding: '20px 16px', background: '#fff',
        border: `1.5px solid ${hovered ? '#F59E0B' : '#E5E7EB'}`, borderRadius: 14,
        cursor: 'pointer', transition: 'all .18s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 6px 16px rgba(0,0,0,.08)' : 'none',
        textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}
    >
      {provider.avatarUrl ? (
        <img src={provider.avatarUrl} alt={name}
          style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E5E7EB', marginBottom: 10 }} />
      ) : (
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: avatarBg(name),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: '1.125rem', marginBottom: 10,
        }}>
          {initials(name)}
        </div>
      )}
      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0A0A0A', marginBottom: 4, lineHeight: 1.3 }}>{name}</p>
      <p style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 700, marginBottom: 8 }}>
        {provider.completedCount || 0} completed
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Star size={12} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0A0A0A' }}>
          {provider.avgRating > 0 ? Number(provider.avgRating).toFixed(1) : '—'}
        </span>
      </div>
    </div>
  );
}

/* ─── Full page skeleton ────────────────────────────────────────────────── */
function ProfileSkeleton() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <style>{GLOBAL_STYLE}</style>
      <div style={{ width: '100%', height: 100, background: '#FEF3C7' }} />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
        <div className="cc-shimmer" style={{ width: 96, height: 96, borderRadius: '50%', marginTop: -48, marginBottom: 20, border: '4px solid #fff' }} />
        <div className="cc-shimmer" style={{ width: 240, height: 28, marginBottom: 12 }} />
        <div className="cc-shimmer" style={{ width: 180, height: 16, marginBottom: 32 }} />
        <div style={{ display: 'flex', gap: 0, border: '1.5px solid #E5E7EB', borderRadius: 14, overflow: 'hidden', marginBottom: 36 }}>
          {[0,1,2].map((i) => (
            <div key={i} style={{ flex: 1, padding: 20, borderRight: i < 2 ? '1px solid #E5E7EB' : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div className="cc-shimmer" style={{ width: 60, height: 24 }} />
              <div className="cc-shimmer" style={{ width: 80, height: 14 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
