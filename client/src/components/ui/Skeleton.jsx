/**
 * Loading skeleton with shimmer animation.
 *
 * @param {'text'|'heading'|'circle'|'rect'|'card'|'listing'|'avatar'} variant
 */
export default function Skeleton({ variant = 'text', className = '', count = 1 }) {
  const base = 'animate-shimmer rounded-lg';

  const styles = {
    text: `${base} h-4 w-full`,
    heading: `${base} h-7 w-3/4`,
    circle: `${base} rounded-full w-10 h-10`,
    avatar: `${base} rounded-full w-12 h-12`,
    rect: `${base} h-40 w-full rounded-xl`,
    card: '',
    listing: '',
  };

  // Full card skeleton
  if (variant === 'card') {
    return (
      <div className={`surface rounded-2xl p-5 sm:p-6 space-y-4 ${className}`}>
        <div className={`${base} h-40 w-full rounded-xl`} />
        <div className={`${base} h-4 w-20`} />
        <div className={`${base} h-5 w-3/4`} />
        <div className={`${base} h-4 w-full`} />
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border-default)]">
          <div className="flex items-center gap-2">
            <div className={`${base} rounded-full w-8 h-8`} />
            <div className={`${base} h-3 w-16`} />
          </div>
          <div className={`${base} h-4 w-12`} />
        </div>
      </div>
    );
  }

  // Full listing skeleton (image + text rows)
  if (variant === 'listing') {
    return (
      <div className={`surface rounded-2xl overflow-hidden ${className}`}>
        <div className={`${base} h-48 w-full rounded-none`} />
        <div className="p-5 space-y-3">
          <div className={`${base} h-4 w-24`} />
          <div className={`${base} h-6 w-5/6`} />
          <div className={`${base} h-4 w-full`} />
          <div className="flex items-center justify-between pt-3 border-t border-[var(--border-default)]">
            <div className="flex items-center gap-2">
              <div className={`${base} rounded-full w-8 h-8`} />
              <div className={`${base} h-3 w-20`} />
            </div>
            <div className={`${base} h-5 w-14`} />
          </div>
        </div>
      </div>
    );
  }

  // Repeat simple skeletons
  if (count > 1) {
    return (
      <div className={`space-y-2.5 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={styles[variant]} />
        ))}
      </div>
    );
  }

  return <div className={`${styles[variant]} ${className}`} />;
}
