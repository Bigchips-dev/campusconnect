/**
 * Base Card component — theme-aware surface with optional hover, accent,
 * and gradient-border variants.
 *
 * @param {'default'|'accent-top'|'gradient-border'} variant
 */
export default function Card({
  children,
  variant = 'default',
  hover = true,
  padding = true,
  className = '',
  ...props
}) {
  const base = [
    'rounded-2xl transition-all duration-200 ease-out',
    padding ? 'p-5 sm:p-6' : '',
    variant === 'accent-top' ? 'card-accent-top' : '',
    variant === 'gradient-border' ? 'gradient-border' : '',
  ];

  const surface = 'surface';
  const hoverStyles = hover
    ? 'hover:shadow-lg hover:-translate-y-0.5 hover:border-[var(--border-strong)] cursor-pointer'
    : '';

  return (
    <div
      className={[...base, surface, hoverStyles, className].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}
