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
  const [animatingId, setAnimatingId] = useState(null);

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
      <div className="flex flex-col gap-10 w-full">
        <div className="animate-step-heading">
          <h2 className="text-[2.5rem] md:text-[3rem] font-[800] leading-[1.1] text-[#0A0A0A] mb-2 tracking-tight">What do you offer?</h2>
          <p className="text-base font-normal text-[#6B7280] animate-step-subheading">Select the categories you offer services in.</p>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {CATEGORIES.map((cat, index) => {
            const isActive = selectedCats.includes(cat.id);
            const Icon = getCategoryIcon(cat.icon);
            const rowDelay = 200 + Math.floor(index / 3) * 80;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCat(cat.id)}
                className={`relative flex flex-col items-center justify-center gap-3 p-4 h-[120px] bg-white rounded-xl text-center transition-all duration-150 cursor-pointer animate-step-field hover:-translate-y-1 hover:shadow-md ${
                  animatingId === cat.id ? 'pulse-snap' : ''
                } ${
                  isActive
                    ? 'border-2 border-[#F59E0B]'
                    : 'border border-[#E5E7EB] hover:border-[#0A0A0A]'
                }`}
                style={{ animationDelay: `${rowDelay}ms` }}
              >
                {isActive && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center bg-[#F59E0B]">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <Icon className="w-6 h-6 text-[#0A0A0A]" style={{ color: cat.color }} />
                <span className="text-sm font-bold text-[#0A0A0A]">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-6 animate-step-btn">
          {onBack ? (
            <button onClick={onBack} className="group flex items-center gap-2 text-[#6B7280] hover:text-[#0A0A0A] font-medium transition-colors duration-200">
              <ArrowLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-[3px]" /> Back
            </button>
          ) : <div />}
          <button onClick={handleContinueToPhase2} className="w-1/2 flex items-center justify-center gap-2 py-4 bg-[#0A0A0A] text-white rounded-xl font-bold transition-all duration-200 hover:bg-[#F59E0B] hover:text-[#0A0A0A] active:scale-[0.98]">
            Next: Add Details <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // ──────── Phase 2: Subcategory details ────────
  return (
    <div className="flex flex-col gap-10 w-full">
      <div className="flex items-start justify-between">
        <div className="animate-step-heading">
          <h2 className="text-[2.5rem] md:text-[3rem] font-[800] leading-[1.1] text-[#0A0A0A] mb-2 tracking-tight">Service Details</h2>
          <p className="text-base font-normal text-[#6B7280] animate-step-subheading">Select subcategories and add details.</p>
        </div>
        <button onClick={() => setPhase(1)} className="group mt-2 flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#0A0A0A] transition-colors">
          <ArrowLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-[3px]" /> Edit
        </button>
      </div>
      {error && <p className="text-sm text-red-500 animate-step-field">{error}</p>}

      {/* Accordion sections for each selected category */}
      <div className="flex flex-col gap-4">
        {selectedCats.map((catId, index) => {
          const cat = CATEGORIES.find((c) => c.id === catId);
          if (!cat) return null;
          const Icon = getCategoryIcon(cat.icon);
          const activeSubs = Object.keys(skillMap[catId] || {});
          const isExpanded = expandedCat === catId;
          const delay = 200 + index * 50;

          return (
            <div key={catId} className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden animate-step-field" style={{ animationDelay: `${delay}ms` }}>
              <button
                type="button"
                onClick={() => setExpandedCat(isExpanded ? null : catId)}
                className="w-full p-5 flex items-center gap-4 cursor-pointer transition-colors duration-150 hover:bg-[#FAFAFA]"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#FAFAFA]">
                  <Icon className="w-5 h-5" style={{ color: cat.color }} />
                </div>
                <h3 className="font-bold text-[#0A0A0A] flex-1 text-left">{cat.name}</h3>
                <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-[#F59E0B]/10 text-[#F59E0B]">
                  {activeSubs.length} selected
                </span>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-[#F59E0B]" /> : <ChevronDown className="w-5 h-5 text-[#F59E0B]" />}
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 space-y-4 border-t border-[#E5E7EB] animate-fade-in-down">
                  {/* Subcategory tags */}
                  <div className="flex flex-wrap gap-2 pt-4">
                    {cat.subcategories.map((sub) => {
                      const isActive = !!skillMap[catId]?.[sub];
                      return (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => toggleSub(catId, sub)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all duration-150 ${
                            isActive
                              ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]'
                              : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#0A0A0A]'
                          }`}
                        >
                          {isActive && <Check className="w-3.5 h-3.5" />}
                          {sub}
                        </button>
                      );
                    })}
                  </div>

                  {/* Details for checked subcategories */}
                  {activeSubs.length > 0 && (
                    <div className="pt-2 space-y-4">
                      {activeSubs.map((sub) => (
                        <div key={sub} className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] animate-fade-in-down">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold text-[#0A0A0A]">{sub}</span>
                            <button onClick={() => toggleSub(catId, sub)} className="p-1.5 rounded-lg hover:bg-[#E5E7EB] transition-colors duration-150">
                              <X className="w-4 h-4 text-[#6B7280]" />
                            </button>
                          </div>
                          <div className="space-y-3">
                            <textarea
                              rows={2}
                              placeholder="Brief description of your service…"
                              value={skillMap[catId]?.[sub]?.description || ''}
                              onChange={(e) => updateSub(catId, sub, 'description', e.target.value)}
                              className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-sm transition-all duration-150 focus:outline-none focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#F59E0B] resize-none"
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <select
                                value={skillMap[catId]?.[sub]?.pricingType || 'FIXED'}
                                onChange={(e) => updateSub(catId, sub, 'pricingType', e.target.value)}
                                className="px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-sm transition-all duration-150 focus:outline-none focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#F59E0B]"
                              >
                                {PRICING_TYPES.map((pt) => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
                              </select>
                              <input
                                type="number" min="0" placeholder="Yrs experience"
                                value={skillMap[catId]?.[sub]?.experience || ''}
                                onChange={(e) => updateSub(catId, sub, 'experience', e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-sm transition-all duration-150 focus:outline-none focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#F59E0B]"
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
      </div>

      {/* Portfolio URLs */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 space-y-4 animate-step-field" style={{ animationDelay: `${200 + selectedCats.length * 50}ms` }}>
        <div>
          <h3 className="font-bold text-[#0A0A0A]">Portfolio Images (optional)</h3>
          <p className="text-sm text-[#6B7280] mt-1">Add up to 3 image URLs showcasing your work</p>
        </div>
        <div className="space-y-3">
          {portfolioUrls.map((url, i) => (
            <input
              key={i}
              type="text"
              placeholder={`Image URL ${i + 1}`}
              value={url}
              onChange={(e) => { const next = [...portfolioUrls]; next[i] = e.target.value; setPortfolioUrls(next); }}
              className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-sm transition-all duration-150 focus:outline-none focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#F59E0B]"
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 animate-step-btn">
        {onBack ? (
          <button onClick={onBack} className="group flex items-center gap-2 text-[#6B7280] hover:text-[#0A0A0A] font-medium transition-colors duration-200">
            <ArrowLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-[3px]" /> Back
          </button>
        ) : <div />}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-1/2 flex items-center justify-center gap-2 py-4 bg-[#0A0A0A] text-white rounded-xl font-bold transition-all duration-200 hover:bg-[#F59E0B] hover:text-[#0A0A0A] active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Continue'}
          {!loading && <ArrowRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
