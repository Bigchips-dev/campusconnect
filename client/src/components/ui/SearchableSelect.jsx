import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

export default function SearchableSelect({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select…',
  error,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className={`space-y-1.5 ${className}`} ref={ref}>
      {label && (
        <label className="block text-sm font-medium" style={{ color: 'var(--text-heading)' }}>
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => { setOpen(!open); setQuery(''); }}
        className={[
          'w-full flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm text-left cursor-pointer',
          'transition-all duration-200',
          error
            ? 'border-error-500 focus:ring-error-500/25'
            : 'border-[var(--border-default)] hover:border-[var(--border-strong)]',
          open ? 'ring-2 ring-[var(--ring-focus)] border-primary-500' : '',
        ].join(' ')}
        style={{ backgroundColor: 'var(--bg-surface)', color: value ? 'var(--text-body)' : 'var(--text-faint)' }}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          style={{ color: 'var(--text-muted)' }}
        />
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1 w-full max-h-64 rounded-xl border shadow-xl overflow-hidden animate-fade-in"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-default)',
            position: 'relative',
          }}
        >
          {/* Search input */}
          <div className="sticky top-0 p-2 border-b" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-faint)' }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                autoFocus
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm border-none outline-none"
                style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-body)' }}
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm" style={{ color: 'var(--text-faint)' }}>No results</p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className={[
                    'w-full flex items-center justify-between px-4 py-2.5 text-sm text-left cursor-pointer',
                    'transition-colors hover:bg-[var(--bg-muted)]',
                  ].join(' ')}
                  style={{ color: opt === value ? 'var(--color-primary-500)' : 'var(--text-body)' }}
                >
                  {opt}
                  {opt === value && <Check className="w-4 h-4 text-primary-500" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-error-500 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-error-500" />
          {error}
        </p>
      )}
    </div>
  );
}
