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
        <label className="block text-sm font-bold text-[#0A0A0A] mb-2">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => { setOpen(!open); setQuery(''); }}
        className={`w-full flex items-center justify-between px-4 py-3 bg-white border ${
          error ? 'border-red-500' : open ? 'border-[#0A0A0A] ring-1 ring-[#F59E0B]' : 'border-[#E5E7EB]'
        } rounded-lg text-sm transition-all focus:outline-none focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#F59E0B]`}
      >
        <span className={`truncate ${value ? 'text-[#0A0A0A]' : 'text-[#6B7280]'}`}>{value || placeholder}</span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 text-[#6B7280] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-64 rounded-xl border border-[#E5E7EB] bg-white shadow-xl overflow-hidden animate-fade-in relative">
          {/* Search input */}
          <div className="sticky top-0 p-2 border-b border-[#E5E7EB] bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                autoFocus
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-[#FAFAFA] text-[#0A0A0A] border-none outline-none"
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-[#6B7280]">No results</p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left cursor-pointer transition-colors hover:bg-[#FAFAFA] ${
                    opt === value ? 'text-[#F59E0B] font-medium' : 'text-[#0A0A0A]'
                  }`}
                >
                  {opt}
                  {opt === value && <Check className="w-4 h-4 text-[#F59E0B]" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
