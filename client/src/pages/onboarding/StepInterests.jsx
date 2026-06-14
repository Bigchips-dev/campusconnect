import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { CATEGORIES } from '../../data/categories';
import { getCategoryIcon } from '../../lib/categoryIcons';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

export default function StepInterests({ progress, onNext, setStepProgress }) {
  const [selected, setSelected] = useState(progress?.interests || []);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (setStepProgress) {
      setStepProgress({ current: 0, total: 1, title: 'Your Interests' });
    }
  }, [setStepProgress]);

  const toggle = (id) => {
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
      setLoading(false);
    }
  };

  return (
    <div className={`w-full flex flex-col ${isAnimating ? 'animate-typeform-exit' : 'animate-typeform-enter'}`}>
      <div className="text-[#6B7280] text-sm font-bold mb-4">
        01 <ArrowRight className="inline w-4 h-4 ml-1 mb-[2px]" />
      </div>
      
      <h2 className="text-[1.75rem] font-[700] text-[#0A0A0A] mb-2 leading-tight">
        What kind of services are you looking for?
      </h2>
      
      <p className="text-[#6B7280] text-base mb-6">Select all that apply — minimum 1</p>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {CATEGORIES.map((cat) => {
          const isActive = selected.includes(cat.id);
          const Icon = getCategoryIcon(cat.icon);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggle(cat.id)}
              className={`relative flex flex-col items-center justify-center gap-3 p-4 h-[120px] rounded-xl text-center transition-all duration-150 cursor-pointer hover:-translate-y-1 hover:shadow-md ${
                isActive
                  ? 'bg-white border-2 border-[#F59E0B]'
                  : 'bg-white border border-[#E5E7EB] hover:border-[#0A0A0A]'
              }`}
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

      <div className="flex flex-col gap-4">
        {selected.length > 0 && (
          <div className="flex items-center gap-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-[140px] h-[44px] flex items-center justify-center gap-2 rounded-lg font-bold transition-all duration-200 bg-[#F59E0B] text-[#0A0A0A] hover:bg-[#d47600] disabled:opacity-50"
            >
              {loading ? '...' : 'Continue'} 
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
