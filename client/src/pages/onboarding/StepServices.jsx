import { useState, useEffect } from 'react';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { CATEGORIES } from '../../data/categories';
import { getCategoryIcon } from '../../lib/categoryIcons';
import { ArrowRight, ArrowLeft, Check, ChevronDown, ChevronUp, X } from 'lucide-react';

const PRICING_TYPES = [
  { value: 'FIXED', label: 'Fixed Price' },
  { value: 'HOURLY', label: 'Per Hour' },
  { value: 'FREE', label: 'Free' },
];

export default function StepServices({ progress, onNext, onBack }) {
  const [phase, setPhase] = useState(1);
  const [selectedCats, setSelectedCats] = useState([]);
  const [skillMap, setSkillMap] = useState({});
  const [portfolioUrls, setPortfolioUrls] = useState(['', '', '']);
  const [expandedCat, setExpandedCat] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      setPhase(2);
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
      if (catMap[sub]) { delete catMap[sub]; } else { catMap[sub] = { description: '', pricingType: 'FIXED', experience: 0 }; }
      return { ...prev, [catId]: catMap };
    });
  };

  const updateSub = (catId, sub, field, value) => {
    setSkillMap((prev) => ({
      ...prev,
      [catId]: { ...prev[catId], [sub]: { ...prev[catId][sub], [field]: value } },
    }));
  };

  const handleContinueToPhase2 = () => {
    if (selectedCats.length === 0) { setError('Select at least one category'); return; }
    setError('');
    setPhase(2);
    setExpandedCat(selectedCats[0]);
  };

  const handleSubmit = async () => {
    const skills = [];
    const cleanPortfolio = portfolioUrls.filter((u) => u.trim());
    selectedCats.forEach((catId) => {
      const subs = skillMap[catId] || {};
      Object.entries(subs).forEach(([subcategory, data]) => {
        skills.push({
          category: catId, subcategory,
          description: data.description, pricingType: data.pricingType,
          experience: parseInt(data.experience) || 0, portfolioUrls: cleanPortfolio,
        });
      });
    });
    if (skills.length === 0) { setError('Select at least one subcategory'); return; }
    setLoading(true);
    try {
      await api.put('/onboarding/skills', { skills });
      onNext();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  // ──────── Phase 1: Select categories ────────
  if (phase === 1) {
    return (
      <div className="space-y-6">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          What services do you offer? Select all relevant categories.
        </p>
        {error && <p className="text-sm text-error-500">{error}</p>}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCats.includes(cat.id);
            const Icon = getCategoryIcon(cat.icon);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCat(cat.id)}
                className={[
                  'relative flex flex-col items-center gap-2.5 p-4 sm:p-5 rounded-2xl border-2 text-center transition-all duration-200 cursor-pointer',
                  isActive ? 'shadow-md' : 'border-[var(--border-default)] hover:border-[var(--border-strong)] hover:shadow-sm',
                ].join(' ')}
                style={{
                  borderColor: isActive ? cat.color : undefined,
                  backgroundColor: isActive ? `${cat.color}10` : undefined,
                }}
              >
                {isActive && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: cat.color }}>
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}CC)`, boxShadow: `0 4px 12px ${cat.color}25` }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs sm:text-sm font-semibold leading-tight" style={{ color: isActive ? cat.color : 'var(--text-heading)' }}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4">
          {onBack ? <Button variant="ghost" onClick={onBack} size="md"><ArrowLeft className="w-4 h-4" /> Back</Button> : <div />}
          <Button onClick={handleContinueToPhase2} size="lg">Next: Add Details <ArrowRight className="w-4 h-4" /></Button>
        </div>
      </div>
    );
  }

  // ──────── Phase 2: Subcategory details ────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select subcategories and add details.</p>
        <Button variant="ghost" size="sm" onClick={() => setPhase(1)}>
          <ArrowLeft className="w-3.5 h-3.5" /> Edit Categories
        </Button>
      </div>
      {error && <p className="text-sm text-error-500">{error}</p>}

      {/* Accordion sections for each selected category */}
      {selectedCats.map((catId) => {
        const cat = CATEGORIES.find((c) => c.id === catId);
        if (!cat) return null;
        const Icon = getCategoryIcon(cat.icon);
        const activeSubs = Object.keys(skillMap[catId] || {});
        const isExpanded = expandedCat === catId;

        return (
          <div key={catId} className="surface rounded-2xl overflow-hidden">
            {/* Category header — click to expand */}
            <button
              type="button"
              onClick={() => setExpandedCat(isExpanded ? null : catId)}
              className="w-full p-4 flex items-center gap-3 cursor-pointer transition-colors hover:bg-[var(--bg-muted)]"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}CC)` }}>
                <Icon className="w-4.5 h-4.5 text-white" />
              </div>
              <h3 className="font-bold text-sm flex-1 text-left" style={{ color: 'var(--text-heading)' }}>{cat.name}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                {activeSubs.length} selected
              </span>
              {isExpanded ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: 'var(--border-default)' }}>
                {/* Subcategory tags */}
                <div className="flex flex-wrap gap-2 pt-3">
                  {cat.subcategories.map((sub) => {
                    const isActive = !!skillMap[catId]?.[sub];
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => toggleSub(catId, sub)}
                        className={[
                          'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer',
                          isActive ? 'border-transparent' : 'border-[var(--border-default)] hover:border-[var(--border-strong)]',
                        ].join(' ')}
                        style={{
                          backgroundColor: isActive ? `${cat.color}15` : undefined,
                          color: isActive ? cat.color : 'var(--text-muted)',
                          borderColor: isActive ? `${cat.color}40` : undefined,
                        }}
                      >
                        {isActive && <Check className="w-3 h-3 inline mr-1" />}
                        {sub}
                      </button>
                    );
                  })}
                </div>

                {/* Details for checked subcategories */}
                {activeSubs.map((sub) => (
                  <div key={sub} className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold" style={{ color: 'var(--text-heading)' }}>{sub}</span>
                      <button onClick={() => toggleSub(catId, sub)} className="p-1 rounded hover:bg-[var(--bg-surface)] cursor-pointer transition-colors">
                        <X className="w-3.5 h-3.5" style={{ color: 'var(--text-faint)' }} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        placeholder="Brief description of your service…"
                        value={skillMap[catId]?.[sub]?.description || ''}
                        onChange={(e) => updateSub(catId, sub, 'description', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
                        style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-body)', borderColor: 'var(--border-default)' }}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={skillMap[catId]?.[sub]?.pricingType || 'FIXED'}
                          onChange={(e) => updateSub(catId, sub, 'pricingType', e.target.value)}
                          className="px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
                          style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-body)', borderColor: 'var(--border-default)' }}
                        >
                          {PRICING_TYPES.map((pt) => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
                        </select>
                        <input
                          type="number" min="0" placeholder="Yrs experience"
                          value={skillMap[catId]?.[sub]?.experience || ''}
                          onChange={(e) => updateSub(catId, sub, 'experience', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-primary-500"
                          style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-body)', borderColor: 'var(--border-default)' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Portfolio URLs */}
      <div className="surface rounded-2xl p-4 space-y-3">
        <h3 className="font-bold text-sm" style={{ color: 'var(--text-heading)' }}>Portfolio Images (optional)</h3>
        <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Add up to 3 image URLs showcasing your work</p>
        {portfolioUrls.map((url, i) => (
          <Input key={i} placeholder={`Image URL ${i + 1}`} value={url}
            onChange={(e) => { const next = [...portfolioUrls]; next[i] = e.target.value; setPortfolioUrls(next); }}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        {onBack ? <Button variant="ghost" onClick={onBack} size="md"><ArrowLeft className="w-4 h-4" /> Back</Button> : <div />}
        <Button onClick={handleSubmit} size="lg" loading={loading}>Continue <ArrowRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}
