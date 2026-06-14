import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { CATEGORIES } from '../../data/categories';
import { getCategoryIcon } from '../../lib/categoryIcons';
import { ArrowRight, ArrowLeft, Check, ChevronDown, ChevronUp, X } from 'lucide-react';

const PRICING_TYPES = [
  { value: 'FIXED', label: 'Fixed Price' },
  { value: 'HOURLY', label: 'Per Hour' },
  { value: 'FREE', label: 'Free' },
];

const INPUT_FOCUS_STYLE = {
  borderColor: '#0A0A0A',
  boxShadow: '0 0 0 3px rgba(245,158,11,0.15)',
};

export default function StepServices({ progress, onNext, onBack, setStepProgress }) {
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedCats, setSelectedCats] = useState([]);
  const [skillMap, setSkillMap] = useState({});
  const [portfolioUrls, setPortfolioUrls] = useState(['', '', '']);
  const [expandedCat, setExpandedCat] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slideKey, setSlideKey] = useState(0);

  const totalQuestions = 2;

  useEffect(() => {
    if (setStepProgress) {
      setStepProgress({ current: currentQIdx, total: totalQuestions, title: 'Your Services' });
    }
  }, [currentQIdx, setStepProgress]);

  // Hydrate from saved progress
  useEffect(() => {
    if (progress?.skills?.length > 0) {
      const cats = [...new Set(progress.skills.map((s) => s.category))];
      setSelectedCats(cats);
      const map = {};
      progress.skills.forEach((s) => {
        if (!map[s.category]) map[s.category] = {};
        map[s.category][s.subcategory] = {
          description: s.description || '',
          pricingType: s.pricingType || 'FIXED',
          experience: s.experience || 0,
        };
      });
      setSkillMap(map);
      if (progress.skills[0]?.portfolioUrls?.length > 0) {
        const urls = progress.skills[0].portfolioUrls;
        setPortfolioUrls([urls[0] || '', urls[1] || '', urls[2] || '']);
      }
      setExpandedCat(cats[0] || null);
    }
  }, [progress]);

  const toggleCat = (id) => {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleSub = (catId, sub) => {
    setSkillMap((prev) => {
      const catMap = { ...(prev[catId] || {}) };
      if (catMap[sub]) {
        delete catMap[sub];
      } else {
        catMap[sub] = { description: '', pricingType: 'FIXED', experience: 0 };
      }
      return { ...prev, [catId]: catMap };
    });
  };

  const updateSub = (catId, sub, field, value) => {
    setSkillMap((prev) => ({
      ...prev,
      [catId]: { ...prev[catId], [sub]: { ...prev[catId][sub], [field]: value } },
    }));
  };

  const goNextQ = () => {
    if (currentQIdx === 0 && selectedCats.length === 0) {
      setError('Select at least one category');
      return;
    }
    setError('');
    if (currentQIdx === 0) {
      if (!expandedCat) setExpandedCat(selectedCats[0]);
      setSlideKey((k) => k + 1);
      setCurrentQIdx(1);
    } else {
      handleSubmit();
    }
  };

  const goPrevQ = () => {
    setError('');
    if (currentQIdx > 0) {
      setSlideKey((k) => k + 1);
      setCurrentQIdx(0);
    } else {
      onBack?.();
    }
  };

  const handleSubmit = async () => {
    const skills = [];
    const cleanPortfolio = portfolioUrls.filter((u) => u.trim());
    selectedCats.forEach((catId) => {
      const subs = skillMap[catId] || {};
      Object.entries(subs).forEach(([subcategory, data]) => {
        skills.push({
          category: catId,
          subcategory,
          description: data.description,
          pricingType: data.pricingType,
          experience: parseInt(data.experience) || 0,
          portfolioUrls: cleanPortfolio,
        });
      });
    });
    if (skills.length === 0) {
      setError('Select at least one subcategory under each service category');
      return;
    }
    setLoading(true);
    try {
      await api.put('/onboarding/skills', { skills });
      onNext();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
      setLoading(false);
    }
  };

  const isLastQ = currentQIdx === totalQuestions - 1;

  return (
    <div key={slideKey} className="w-full flex flex-col animate-typeform-enter">
      {/* Question number */}
      <div
        style={{
          fontSize: '0.8125rem',
          fontWeight: 700,
          color: '#6B7280',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        {String(currentQIdx + 1).padStart(2, '0')}{' '}
        <ArrowRight size={14} style={{ display: 'inline' }} />
      </div>

      {/* Title */}
      <h2
        style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#0A0A0A',
          lineHeight: 1.25,
          marginBottom: '8px',
        }}
      >
        {currentQIdx === 0 ? 'What services do you offer?' : 'Add details for each service'}
      </h2>
      <p style={{ fontSize: '1rem', color: '#6B7280', marginBottom: '28px' }}>
        {currentQIdx === 0 ? 'Select all that apply' : 'Configure subcategories and descriptions'}
      </p>

      {error && (
        <p style={{ color: '#EF4444', fontSize: '0.875rem', marginBottom: '12px' }}>{error}</p>
      )}

      {/* Content */}
      <div style={{ width: '100%', marginBottom: '28px' }}>
        {currentQIdx === 0 ? (
          /* ── Q1: Category grid ── */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
            }}
          >
            {CATEGORIES.map((cat) => {
              const isActive = selectedCats.includes(cat.id);
              const Icon = getCategoryIcon(cat.icon);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCat(cat.id)}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '16px 8px',
                    height: '110px',
                    borderRadius: '12px',
                    border: isActive ? '2px solid #F59E0B' : '1.5px solid #E5E7EB',
                    background: '#fff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = '#0A0A0A';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#F59E0B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Check size={11} color="#fff" strokeWidth={3} />
                    </div>
                  )}
                  <Icon size={22} style={{ color: cat.color }} />
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#0A0A0A',
                      lineHeight: 1.3,
                    }}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          /* ── Q2: Accordion detail view ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {selectedCats.map((catId) => {
              const cat = CATEGORIES.find((c) => c.id === catId);
              if (!cat) return null;
              const Icon = getCategoryIcon(cat.icon);
              const activeSubs = Object.keys(skillMap[catId] || {});
              const isExpanded = expandedCat === catId;

              return (
                <div
                  key={catId}
                  style={{
                    background: '#fff',
                    borderRadius: '14px',
                    border: '1.5px solid #E5E7EB',
                    overflow: 'hidden',
                  }}
                >
                  {/* Accordion header */}
                  <button
                    type="button"
                    onClick={() => setExpandedCat(isExpanded ? null : catId)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#FAFAFA')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: '#FAFAFA',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={18} style={{ color: cat.color }} />
                    </div>
                    <h3
                      style={{
                        flex: 1,
                        textAlign: 'left',
                        fontWeight: 700,
                        fontSize: '0.9375rem',
                        color: '#0A0A0A',
                      }}
                    >
                      {cat.name}
                    </h3>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#F59E0B',
                        padding: '2px 10px',
                        borderRadius: '9999px',
                        background: 'rgba(245,158,11,0.1)',
                      }}
                    >
                      {activeSubs.length} selected
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={18} color="#F59E0B" />
                    ) : (
                      <ChevronDown size={18} color="#F59E0B" />
                    )}
                  </button>

                  {isExpanded && (
                    <div
                      style={{ padding: '0 20px 20px', borderTop: '1px solid #E5E7EB' }}
                      className="animate-fade-in-down"
                    >
                      {/* Subcategory chips */}
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                          paddingTop: '16px',
                          marginBottom: '16px',
                        }}
                      >
                        {cat.subcategories.map((sub) => {
                          const active = !!skillMap[catId]?.[sub];
                          return (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => toggleSub(catId, sub)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '6px 14px',
                                borderRadius: '9999px',
                                fontSize: '0.8125rem',
                                fontWeight: 600,
                                border: active ? '1.5px solid #F59E0B' : '1.5px solid #E5E7EB',
                                background: active ? 'rgba(245,158,11,0.08)' : '#fff',
                                color: active ? '#d97706' : '#6B7280',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                              }}
                            >
                              {active && <Check size={12} strokeWidth={3} />}
                              {sub}
                            </button>
                          );
                        })}
                      </div>

                      {/* Detail cards for checked subs */}
                      {activeSubs.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {activeSubs.map((sub) => (
                            <div
                              key={sub}
                              style={{
                                padding: '16px',
                                borderRadius: '10px',
                                background: '#FAFAFA',
                                border: '1px solid #E5E7EB',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  marginBottom: '12px',
                                }}
                              >
                                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0A0A0A' }}>
                                  {sub}
                                </span>
                                <button
                                  onClick={() => toggleSub(catId, sub)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    borderRadius: '6px',
                                    display: 'flex',
                                  }}
                                >
                                  <X size={15} color="#9CA3AF" />
                                </button>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <textarea
                                  rows={2}
                                  placeholder="Brief description of your service…"
                                  value={skillMap[catId]?.[sub]?.description || ''}
                                  onChange={(e) => updateSub(catId, sub, 'description', e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    background: '#fff',
                                    border: '1.5px solid #E5E7EB',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    fontFamily: 'inherit',
                                    outline: 'none',
                                    resize: 'none',
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                  }}
                                  onFocus={(e) => Object.assign(e.target.style, INPUT_FOCUS_STYLE)}
                                  onBlur={(e) => {
                                    e.target.style.borderColor = '#E5E7EB';
                                    e.target.style.boxShadow = 'none';
                                  }}
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                  <select
                                    value={skillMap[catId]?.[sub]?.pricingType || 'FIXED'}
                                    onChange={(e) => updateSub(catId, sub, 'pricingType', e.target.value)}
                                    style={{
                                      padding: '10px 14px',
                                      background: '#fff',
                                      border: '1.5px solid #E5E7EB',
                                      borderRadius: '8px',
                                      fontSize: '0.875rem',
                                      fontFamily: 'inherit',
                                      outline: 'none',
                                      cursor: 'pointer',
                                    }}
                                    onFocus={(e) => Object.assign(e.target.style, INPUT_FOCUS_STYLE)}
                                    onBlur={(e) => {
                                      e.target.style.borderColor = '#E5E7EB';
                                      e.target.style.boxShadow = 'none';
                                    }}
                                  >
                                    {PRICING_TYPES.map((pt) => (
                                      <option key={pt.value} value={pt.value}>
                                        {pt.label}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder="Yrs experience"
                                    value={skillMap[catId]?.[sub]?.experience || ''}
                                    onChange={(e) => updateSub(catId, sub, 'experience', e.target.value)}
                                    style={{
                                      width: '100%',
                                      padding: '10px 14px',
                                      background: '#fff',
                                      border: '1.5px solid #E5E7EB',
                                      borderRadius: '8px',
                                      fontSize: '0.875rem',
                                      fontFamily: 'inherit',
                                      outline: 'none',
                                    }}
                                    onFocus={(e) => Object.assign(e.target.style, INPUT_FOCUS_STYLE)}
                                    onBlur={(e) => {
                                      e.target.style.borderColor = '#E5E7EB';
                                      e.target.style.boxShadow = 'none';
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Portfolio URLs (Q2 only) */}
            <div
              style={{
                marginTop: '8px',
                padding: '20px',
                background: '#FAFAFA',
                border: '1.5px solid #E5E7EB',
                borderRadius: '14px',
              }}
            >
              <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0A0A0A', marginBottom: '4px' }}>
                Portfolio Images (optional)
              </p>
              <p style={{ fontSize: '0.8125rem', color: '#6B7280', marginBottom: '14px' }}>
                Add up to 3 image URLs showcasing your work
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {portfolioUrls.map((url, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`Image URL ${i + 1}`}
                    value={url}
                    onChange={(e) => {
                      const next = [...portfolioUrls];
                      next[i] = e.target.value;
                      setPortfolioUrls(next);
                    }}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '10px 14px',
                      background: '#fff',
                      border: '1.5px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                    onFocus={(e) => Object.assign(e.target.style, INPUT_FOCUS_STYLE)}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E7EB';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {(currentQIdx === 1 || selectedCats.length > 0) && (
          <button
            onClick={goNextQ}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              height: '44px',
              width: isLastQ ? '140px' : '120px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.9375rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              background: isLastQ ? '#F59E0B' : '#0A0A0A',
              color: isLastQ ? '#0A0A0A' : '#fff',
              opacity: loading ? 0.5 : 1,
              transition: 'background 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = isLastQ ? '#d97706' : '#F59E0B';
                e.currentTarget.style.color = '#0A0A0A';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = isLastQ ? '#F59E0B' : '#0A0A0A';
                e.currentTarget.style.color = isLastQ ? '#0A0A0A' : '#fff';
              }
            }}
          >
            {loading ? '…' : isLastQ ? 'Continue' : 'OK'}{' '}
            {!loading && <ArrowRight size={16} />}
          </button>
        )}

        {(currentQIdx > 0 || onBack) && (
          <button
            onClick={goPrevQ}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#6B7280',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              marginTop: '4px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#0A0A0A')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
          >
            <ArrowLeft size={14} /> Back
          </button>
        )}
      </div>
    </div>
  );
}
