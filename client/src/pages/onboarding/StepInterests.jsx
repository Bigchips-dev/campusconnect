import { useState } from 'react';
import api from '../../lib/api';
import { CATEGORIES } from '../../data/categories';
import { getCategoryIcon } from '../../lib/categoryIcons';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

export default function StepInterests({ progress, onNext, onBack }) {
  const [selected, setSelected] = useState(progress?.interests || []);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [animatingId, setAnimatingId] = useState(null);

  const toggle = (id) => {
    setAnimatingId(id);
    setTimeout(() => setAnimatingId(null), 150);
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    setError('');
  };

  const handleSubmit = async () => {
    if (selected.length === 0) {
      setError('Please select at least one interest');
      return;
    }
    setLoading(true);
    try {
      await api.put('/onboarding/interests', { interests: selected });
      onNext();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 w-full">
      {/* Header */}
      <div className="animate-step-heading">
        <h2 className="text-[2.5rem] md:text-[3rem] font-[800] leading-[1.1] text-[#0A0A0A] mb-2 tracking-tight">What are you looking for?</h2>
        <p className="text-base font-normal text-[#6B7280] animate-step-subheading">Select all the services you might need.</p>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>

      {/* Category cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {CATEGORIES.map((cat, index) => {
          const isActive = selected.includes(cat.id);
          const Icon = getCategoryIcon(cat.icon);
          const rowDelay = 200 + Math.floor(index / 3) * 80;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggle(cat.id)}
              className={`relative flex flex-col items-center justify-center gap-3 p-4 h-[120px] bg-white rounded-xl text-center transition-all duration-150 cursor-pointer animate-step-field hover:-translate-y-1 hover:shadow-md ${
                animatingId === cat.id ? 'pulse-snap' : ''
              } ${
                isActive
                  ? 'border-2 border-[#F59E0B]'
                  : 'border border-[#E5E7EB] hover:border-[#0A0A0A]'
              }`}
              style={{ animationDelay: `${rowDelay}ms` }}
            >
              {/* Check badge */}
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

      <p className="text-sm text-center text-[#6B7280] animate-step-field" style={{ animationDelay: '500ms' }}>
        {selected.length} selected · minimum 1 required
      </p>

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
