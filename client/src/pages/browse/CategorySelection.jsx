import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { getCategoryIcon } from '../../lib/categoryIcons';

/* ─── Shared micro-animation keyframe injected once ──────────────────────── */
const GLOBAL_STYLE = `
  @keyframes cc-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
  .cc-shimmer { animation: cc-pulse 1.6s ease-in-out infinite; }
  @media (max-width:640px){
    .cat-grid { grid-template-columns: repeat(2,1fr) !important; gap:12px !important; }
  }
`;

export default function CategorySelection() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? CATEGORIES.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.description.toLowerCase().includes(query.toLowerCase())
      )
    : CATEGORIES;

  return (
    <div className="page-wrapper" style={{ background: '#fff', fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <style>{GLOBAL_STYLE}</style>
      <div className="page-container">

        {/* Heading */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.025em', marginBottom: 6, lineHeight: 1.15 }}>
            Explore Services
          </h1>
          <p style={{ fontSize: '1.0625rem', color: '#6B7280', fontWeight: 500 }}>
            What are you looking for today?
          </p>
        </div>

        {/* Search bar */}
        <div style={{ position: 'relative', maxWidth: 580, marginBottom: 44 }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search services…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%', height: 52, paddingLeft: 46, paddingRight: 16,
              fontSize: '0.9375rem', border: '1.5px solid #E5E7EB', borderRadius: 12,
              outline: 'none', background: '#fff', color: '#0A0A0A',
              fontFamily: 'inherit', boxSizing: 'border-box',
              transition: 'border-color .2s, box-shadow .2s',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#F59E0B'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,.15)'; }}
            onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#6B7280' }}>
            <p style={{ fontSize: '1rem', fontWeight: 600 }}>No categories match "{query}"</p>
            <button onClick={() => setQuery('')} style={{ marginTop: 12, color: '#F59E0B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9375rem' }}>
              Clear search
            </button>
          </div>
        ) : (
          <div className="cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {filtered.map((cat) => (
              <CategoryCard key={cat.id} cat={cat} onClick={() => navigate(`/services/category/${cat.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryCard({ cat, onClick }) {
  const Icon = getCategoryIcon(cat.icon);
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        padding: '28px 16px 22px', background: '#fff',
        border: `1.5px solid ${hovered ? '#F59E0B' : '#E5E7EB'}`, borderRadius: 14,
        cursor: 'pointer', transition: 'all .18s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,.09)' : '0 1px 3px rgba(0,0,0,.04)',
        width: '100%', fontFamily: 'inherit',
      }}
    >
      {/* Icon bubble */}
      <div style={{
        width: 56, height: 56, borderRadius: 14, background: `${cat.color}1A`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
        transition: 'background .18s',
      }}>
        <Icon size={26} style={{ color: cat.color }} />
      </div>
      <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0A0A0A', marginBottom: 6, lineHeight: 1.3 }}>
        {cat.name}
      </p>
      <p style={{
        fontSize: '0.8125rem', color: '#6B7280', lineHeight: 1.5, margin: 0,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {cat.description}
      </p>
    </button>
  );
}
