export default function Input({
  label,
  error,
  icon: Icon,
  className = '',
  id,
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium"
          style={{ color: 'var(--text-heading)' }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none"
            style={{ color: 'var(--text-faint)' }}
          />
        )}
        <input
          id={inputId}
          className={[
            'w-full rounded-xl border px-4 py-2.5 text-sm',
            'transition-all duration-200 ease-out',
            'placeholder:text-[var(--text-faint)]',
            'focus:outline-none focus:ring-2',
            Icon ? 'pl-11' : '',
            error
              ? 'border-error-500 focus:border-error-500 focus:ring-error-500/25'
              : 'border-[var(--border-default)] focus:border-primary-500 focus:ring-[var(--ring-focus)]',
          ].join(' ')}
          style={{
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-body)',
          }}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-error-500 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-error-500" />
          {error}
        </p>
      )}
    </div>
  );
}
