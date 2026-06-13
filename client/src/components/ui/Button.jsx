import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm',
  secondary:
    'bg-transparent text-secondary-500 border-2 border-secondary-400 hover:bg-secondary-50 hover:border-secondary-500 hover:-translate-y-0.5 active:translate-y-0 dark:hover:bg-secondary-950/30',
  accent:
    'bg-accent-400 text-navy-950 font-bold hover:bg-accent-300 shadow-md shadow-accent-400/20 hover:shadow-lg hover:shadow-accent-400/30 hover:-translate-y-0.5 active:translate-y-0',
  ghost:
    'bg-transparent hover:bg-navy-100 dark:hover:bg-navy-800 text-[var(--text-body)]',
  danger:
    'bg-error-500 text-white hover:bg-error-600 shadow-md shadow-error-500/20 hover:shadow-lg hover:shadow-error-500/30',
};

const sizes = {
  sm: 'px-3.5 py-1.5 text-sm gap-1.5 rounded-lg',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-7 py-3.5 text-base gap-2.5 rounded-xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  ...props
}) {
  // Handle dark-mode overrides for secondary variant
  const darkSecondary =
    variant === 'secondary'
      ? '[data-theme="dark"] &:hover { background: rgba(255,77,109,0.08); }'
      : '';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center font-semibold',
        'transition-all duration-200 ease-out',
        'cursor-pointer select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none',
        'focus-ring',
        variants[variant],
        sizes[size],
        className,
      ].join(' ')}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
