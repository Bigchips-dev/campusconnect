import { useState } from 'react';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import { CATEGORIES } from '../../data/categories';
import { getCategoryIcon } from '../../lib/categoryIcons';
import { isVirtualEligible } from '../../config/virtualCategories';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

export default function StepInterests({ progress, onNext, onBack }) {
  const [selected, setSelected] = useState(progress?.interests || []);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
          What services are you looking for? Select all that apply.
        </p>
        {error && <p className="text-sm text-error-500 mt-2">{error}</p>}
      </div>

      {/* Category cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CATEGORIES.map((cat) => {
          const isActive = selected.includes(cat.id);
          const Icon = getCategoryIcon(cat.icon);
          const virtual = isVirtualEligible(cat.id);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggle(cat.id)}
              className={[
                'relative flex flex-col items-center gap-2.5 p-4 sm:p-5 rounded-2xl border-2 text-center transition-all duration-200 cursor-pointer',
                isActive
                  ? 'shadow-md'
                  : 'border-[var(--border-default)] hover:border-[var(--border-strong)] hover:shadow-sm',
              ].join(' ')}
              style={{
                borderColor: isActive ? cat.color : undefined,
                backgroundColor: isActive ? `${cat.color}10` : undefined,
              }}
            >
              {/* Check badge */}
              {isActive && (
                <div
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: cat.color }}
                >
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${cat.color}, ${cat.color}CC)`,
                  boxShadow: `0 4px 12px ${cat.color}25`,
                }}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>

              <div className="space-y-0.5">
                <span
                  className="text-xs sm:text-sm font-semibold leading-tight block"
                  style={{ color: isActive ? cat.color : 'var(--text-heading)' }}
                >
                  {cat.name}
                </span>
                {virtual && (
                  <span className="text-[10px] font-bold uppercase text-primary-500">Virtual</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-center" style={{ color: 'var(--text-faint)' }}>
        {selected.length} selected · minimum 1 required
      </p>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        {onBack ? (
          <Button variant="ghost" onClick={onBack} size="md">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        ) : <div />}
        <Button onClick={handleSubmit} size="lg" loading={loading}>
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
