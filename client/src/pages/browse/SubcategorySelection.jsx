import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Users } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { getCategoryIcon } from '../../lib/categoryIcons';
import api from '../../lib/api';

const GLOBAL_STYLE = `
  @keyframes cc-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
  .cc-shimmer { background:#F3F4F6; animation: cc-pulse 1.6s ease-in-out infinite; }
  @media (max-width:640px){
    .sub-grid { grid-template-columns: repeat(2,1fr) !important; gap:10px !important; }
  }
`;

export default function SubcategorySelection() {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const cat = CATEGORIES.find((c) => c.id === categoryId);
  const Icon = cat ? getCategoryIcon(cat.icon) : null;

  // Provider count per subcategory
  const [subCounts, setSubCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cat) { setLoading(false); return; }
    const fetchCounts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/users/providers?category=${categoryId}`);
        const providers = data.data || [];
        const counts = {};
        providers.forEach((p) => {
          (p.skills || []).forEach((s) => {
            if (s.category === categoryId) {
              counts[s.subcategory] = (counts[s.subcategory] || 0) + 1;
            }
          });
        });
        setSubCounts(counts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, [categoryId]);

  if (!cat) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#6B7280', fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif" }}>
        <p style={{ fontWeight: 600 }}>Category not found.</p>
        <button onClick={() => navigate('/services')} style={{ marginTop: 12, color: '#F59E0B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
          ← Back to categories
        </button>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ background: '#fff', fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <style>{GLOBAL_STYLE}</style>
      <div className="page-container">

        {/* Breadcrumb */}
        <button
          onClick={() => navigate('/services')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24, padding: '8px 0',
            fontSize: '0.875rem', fontWeight: 600, color: '#6B7280',
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#0A0A0A')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
        >
          <ChevronLeft size={17} /> All Categories
        </button>

        {/* Category heading */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 6 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: `${cat.color}1A`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon size={26} style={{ color: cat.color }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.02em', marginBottom: 3, lineHeight: 1.2 }}>
              {cat.name}
            </h1>
            <p style={{ fontSize: '0.9375rem', color: '#6B7280' }}>{cat.description}</p>
          </div>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#9CA3AF', marginTop: 16, marginBottom: 36 }}>
          Choose a subcategory to see available providers
        </p>

        {/* Subcategory grid */}
        <div className="sub-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {cat.subcategories.map((sub) => {
            const count = subCounts[sub];
            return (
              <SubCard
                key={sub}
                sub={sub}
                count={loading ? null : (count ?? 0)}
                catColor={cat.color}
                loading={loading}
                onClick={() => navigate(`/services/category/${categoryId}/subcategory/${encodeURIComponent(sub)}`)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SubCard({ sub, count, catColor, loading, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left',
        padding: '20px 18px', background: '#fff',
        border: `1.5px solid ${hovered ? '#F59E0B' : '#E5E7EB'}`, borderRadius: 12,
        cursor: 'pointer', transition: 'all .18s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 6px 20px rgba(0,0,0,.08)' : '0 1px 3px rgba(0,0,0,.03)',
        width: '100%', fontFamily: 'inherit',
      }}
    >
      <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0A0A0A', marginBottom: 10, lineHeight: 1.3 }}>
        {sub}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <Users size={13} style={{ color: catColor, flexShrink: 0 }} />
        {loading ? (
          <span className="cc-shimmer" style={{ display: 'inline-block', width: 48, height: 11, borderRadius: 6 }} />
        ) : (
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#9CA3AF' }}>
            {count === 0 ? 'No providers yet' : `${count} provider${count !== 1 ? 's' : ''}`}
          </span>
        )}
      </div>
    </button>
  );
}
