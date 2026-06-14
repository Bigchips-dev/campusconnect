import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Star, CheckCircle2, XCircle, Briefcase, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { getCategoryIcon } from '../../lib/categoryIcons';
import api from '../../lib/api';

const GLOBAL_STYLE = `
  @keyframes cc-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
  .cc-shimmer { background:#F3F4F6; animation: cc-pulse 1.6s ease-in-out infinite; border-radius:8px; }
  @media (max-width:640px){
    .prov-grid { grid-template-columns: 1fr !important; }
  }
  @media (min-width:641px) and (max-width:1023px){
    .prov-grid { grid-template-columns: repeat(2,1fr) !important; }
  }
`;

const SORT_OPTIONS = [
  { key: 'rating',    label: 'Top Rated' },
  { key: 'completed', label: 'Most Completed' },
  { key: 'priceLow',  label: 'Price: Low → High' },
  { key: 'priceHigh', label: 'Price: High → Low' },
];

function sortProviders(providers, sort) {
  const arr = [...providers];
  switch (sort) {
    case 'rating':
      return arr.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
    case 'completed':
      return arr.sort((a, b) => (b.completedCount || 0) - (a.completedCount || 0));
    case 'priceLow':
      return arr.sort((a, b) => (Number(a.topListing?.price) || 0) - (Number(b.topListing?.price) || 0));
    case 'priceHigh':
      return arr.sort((a, b) => (Number(b.topListing?.price) || 0) - (Number(a.topListing?.price) || 0));
    default:
      return arr;
  }
}

export default function ProvidersList() {
  const { categoryId, subcategoryId } = useParams();
  const navigate = useNavigate();

  const subcategory = decodeURIComponent(subcategoryId || '');
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  const Icon = cat ? getCategoryIcon(cat.icon) : null;

  const [allProviders, setAllProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('rating');

  // Fetch providers for this category using existing API
  useEffect(() => {
    setLoading(true);
    api.get(`/users/providers?category=${categoryId}`)
      .then(({ data }) => {
        const raw = data.data || [];
        // Filter client-side to providers who offer this exact subcategory
        const filtered = raw.filter((p) =>
          (p.skills || []).some(
            (s) => s.category === categoryId && s.subcategory === subcategory
          )
        );
        setAllProviders(filtered);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [categoryId, subcategory]);

  const sorted = useMemo(() => sortProviders(allProviders, sort), [allProviders, sort]);

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <style>{GLOBAL_STYLE}</style>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Breadcrumb trail */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 36, flexWrap: 'wrap' }}>
          <BreadBtn onClick={() => navigate('/services')}>All Categories</BreadBtn>
          <ChevronRight size={14} style={{ color: '#D1D5DB' }} />
          <BreadBtn onClick={() => navigate(`/services/category/${categoryId}`)}>
            {cat?.name || categoryId}
          </BreadBtn>
          <ChevronRight size={14} style={{ color: '#D1D5DB' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0A0A0A' }}>{subcategory}</span>
        </div>

        {/* Page heading */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.025em', marginBottom: 6 }}>
            {subcategory}
          </h1>
          {loading ? (
            <span className="cc-shimmer" style={{ display: 'inline-block', width: 130, height: 16 }} />
          ) : (
            <p style={{ fontSize: '1rem', color: '#6B7280', fontWeight: 500 }}>
              {sorted.length} provider{sorted.length !== 1 ? 's' : ''} available
            </p>
          )}
        </div>

        {/* Sort pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
          {SORT_OPTIONS.map((opt) => (
            <SortPill key={opt.key} label={opt.label} active={sort === opt.key} onClick={() => setSort(opt.key)} />
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="prov-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {Array.from({ length: 6 }).map((_, i) => <ProviderSkeleton key={i} />)}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState subcategory={subcategory} onBack={() => navigate(`/services/category/${categoryId}`)} />
        ) : (
          <div className="prov-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {sorted.map((p) => (
              <ProviderCard key={p.id} provider={p} onClick={() => navigate(`/provider/${p.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Sort pill ─────────────────────────────────────────────────────────── */
function SortPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px', borderRadius: 9999,
        border: `1.5px solid ${active ? '#0A0A0A' : '#E5E7EB'}`,
        background: active ? '#0A0A0A' : '#fff',
        color: active ? '#fff' : '#6B7280',
        fontSize: '0.8125rem', fontWeight: 600,
        cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit',
      }}
      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = '#0A0A0A'; e.currentTarget.style.color = '#0A0A0A'; } }}
      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280'; } }}
    >
      {label}
    </button>
  );
}

/* ─── Breadcrumb button ─────────────────────────────────────────────────── */
function BreadBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
      onMouseEnter={(e) => (e.currentTarget.style.color = '#F59E0B')}
      onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
    >
      {children}
    </button>
  );
}

/* ─── Provider card ─────────────────────────────────────────────────────── */
function ProviderCard({ provider, onClick }) {
  const [hovered, setHovered] = useState(false);
  const name = `${provider.firstName || ''} ${provider.lastName || ''}`.trim();
  const initials = name.split(' ').filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const PALETTE = ['#7C3AED','#EF4444','#10B981','#F59E0B','#0EA5E9','#EC4899','#F97316'];
  const hash = name.split('').reduce((h, c) => c.charCodeAt(0) + ((h << 5) - h), 0);
  const avatarBg = PALETTE[Math.abs(hash) % PALETTE.length];

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        padding: '24px 20px 20px', background: '#fff',
        border: `1.5px solid ${hovered ? '#F59E0B' : '#E5E7EB'}`, borderRadius: 14,
        cursor: 'pointer', transition: 'all .18s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? '0 10px 28px rgba(0,0,0,.09)' : '0 1px 3px rgba(0,0,0,.04)',
      }}
    >
      {/* Avatar */}
      {provider.avatarUrl ? (
        <img src={provider.avatarUrl} alt={name}
          style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid #E5E7EB', marginBottom: 14 }}
        />
      ) : (
        <div style={{
          width: 72, height: 72, borderRadius: '50%', background: avatarBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: '1.375rem', marginBottom: 14,
          border: '2.5px solid rgba(255,255,255,.3)',
        }}>
          {initials}
        </div>
      )}

      {/* Name */}
      <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0A0A0A', marginBottom: 4, lineHeight: 1.3 }}>{name}</p>

      {/* Faculty */}
      <p style={{ fontSize: '0.8125rem', color: '#9CA3AF', marginBottom: 14, fontWeight: 500 }}>
        {provider.faculty || provider.university || 'Campus Student'}
      </p>

      {/* Rating */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
        <Star size={15} style={{ color: '#F59E0B', fill: '#F59E0B', flexShrink: 0 }} />
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0A0A0A' }}>
          {provider.avgRating > 0 ? Number(provider.avgRating).toFixed(1) : '—'}
        </span>
        {provider.reviewCount > 0 && (
          <span style={{ fontSize: '0.8125rem', color: '#9CA3AF' }}>({provider.reviewCount} reviews)</span>
        )}
      </div>

      {/* Completed in amber */}
      <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#F59E0B', marginBottom: 14 }}>
        {provider.completedCount || 0} completed
      </p>

      {/* Verified badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 18 }}>
        {provider.emailVerified !== false ? (
          <>
            <CheckCircle2 size={14} style={{ color: '#10B981', flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10B981' }}>Email verified</span>
          </>
        ) : (
          <>
            <XCircle size={14} style={{ color: '#9CA3AF', flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF' }}>Not verified</span>
          </>
        )}
      </div>

      {/* View Profile btn */}
      <button
        style={{
          width: '100%', height: 40, borderRadius: 8,
          background: hovered ? '#F59E0B' : '#0A0A0A', color: hovered ? '#0A0A0A' : '#fff',
          fontWeight: 700, fontSize: '0.875rem', border: 'none',
          cursor: 'pointer', transition: 'background .18s, color .18s', fontFamily: 'inherit',
        }}
      >
        View Profile
      </button>
    </div>
  );
}

/* ─── Skeleton card ─────────────────────────────────────────────────────── */
function ProviderSkeleton() {
  return (
    <div style={{ padding: '24px 20px', border: '1.5px solid #E5E7EB', borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div className="cc-shimmer" style={{ width: 72, height: 72, borderRadius: '50%' }} />
      <div className="cc-shimmer" style={{ width: '60%', height: 16 }} />
      <div className="cc-shimmer" style={{ width: '45%', height: 13 }} />
      <div className="cc-shimmer" style={{ width: '40%', height: 13 }} />
      <div className="cc-shimmer" style={{ width: '100%', height: 40, borderRadius: 8, marginTop: 4 }} />
    </div>
  );
}

/* ─── Empty state ───────────────────────────────────────────────────────── */
function EmptyState({ subcategory, onBack }) {
  return (
    <div style={{ textAlign: 'center', padding: '72px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(245,158,11,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Briefcase size={32} style={{ color: '#F59E0B' }} />
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A0A0A', marginBottom: 8 }}>
        No providers yet in {subcategory}
      </h3>
      <p style={{ fontSize: '0.9375rem', color: '#6B7280', maxWidth: 380, lineHeight: 1.6, marginBottom: 28 }}>
        Check back soon or browse other categories — new providers join every day.
      </p>
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '10px 22px', borderRadius: 9999,
          background: '#0A0A0A', color: '#fff', fontWeight: 700,
          fontSize: '0.9375rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <ChevronLeft size={16} /> Browse other subcategories
      </button>
    </div>
  );
}
