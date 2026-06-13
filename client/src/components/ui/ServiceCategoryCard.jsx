/**
 * Service Category Card — bold icon with the category's own color.
 * Used on the homepage, category browser, and browse page.
 *
 * @param {React.ComponentType} icon - A Lucide icon component
 * @param {string} name - Category display name
 * @param {string} description - Short category description
 * @param {number} count - Number of services in this category
 * @param {string} color - Hex color from category data (e.g. "#4F46E5")
 * @param {boolean} isVirtual - Whether the category supports virtual delivery
 * @param {Function} onClick
 */
export default function ServiceCategoryCard({
  icon: Icon,
  name,
  description,
  count,
  color = '#7C3AED',
  isVirtual = false,
  onClick,
  className = '',
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'group surface flex items-center gap-4 p-4 sm:p-5 rounded-2xl w-full text-left',
        'transition-all duration-200 ease-out cursor-pointer',
        'hover:shadow-lg hover:-translate-y-0.5 hover:border-[var(--border-strong)]',
        'focus-ring',
        className,
      ].join(' ')}
    >
      {/* Icon container with category color */}
      <div
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${color}, ${adjustBrightness(color, -30)})`,
          boxShadow: `0 8px 16px ${color}30`,
        }}
      >
        {Icon && <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3
            className="font-bold text-sm sm:text-base truncate group-hover:text-primary-500 transition-colors"
            style={{ color: 'var(--text-heading)' }}
          >
            {name}
          </h3>
          {isVirtual && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-md bg-primary-100 dark:bg-primary-950/30 text-primary-600 dark:text-primary-300 leading-none">
              Virtual
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
            {description}
          </p>
        )}
        {count !== undefined && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
            {count} {count === 1 ? 'service' : 'services'}
          </p>
        )}
      </div>

      {/* Hover arrow */}
      <svg
        className="w-5 h-5 flex-shrink-0 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
        style={{ color: 'var(--text-muted)' }}
        fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </button>
  );
}

/** Darken/lighten a hex color by a given amount (-100 to 100) */
function adjustBrightness(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}
