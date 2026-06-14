import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-[#0A0A0A] text-white hover:bg-[#F59E0B] hover:text-[#0A0A0A] shadow-md shadow-black/10 hover:shadow-lg hover:shadow-[#F59E0B]/20 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm',
  secondary:
    'bg-transparent text-[#0A0A0A] border-2 border-[#E5E7EB] hover:bg-[#FAFAFA] hover:border-[#F59E0B] hover:-translate-y-0.5 active:translate-y-0',
  accent:
    'bg-[#F59E0B] text-[#0A0A0A] font-bold hover:bg-[#D97706] shadow-md shadow-[#F59E0B]/20 hover:shadow-lg hover:shadow-[#F59E0B]/30 hover:-translate-y-0.5 active:translate-y-0',
  ghost:
    'bg-transparent hover:bg-[#FAFAFA] text-[#0A0A0A]',
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
