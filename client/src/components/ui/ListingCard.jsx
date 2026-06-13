import { Star, MessageSquare } from 'lucide-react';
import Avatar from './Avatar';
import { CATEGORIES } from '../../data/categories';

const categoryColors = {
  TUTORING: 'bg-primary-100 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300',
  DESIGN: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-950/40 dark:text-secondary-300',
  PHOTOGRAPHY: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  MOVING: 'bg-accent-100 text-accent-700 dark:bg-accent-950/40 dark:text-accent-300',
  CLEANING: 'bg-success-100 text-success-700 dark:bg-success-700/20 dark:text-success-300',
  TECH_SUPPORT: 'bg-navy-100 text-navy-700 dark:bg-navy-800 dark:text-navy-200',
  WRITING: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  FITNESS: 'bg-error-100 text-error-700 dark:bg-error-700/20 dark:text-error-300',
  MUSIC: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  OTHER: 'bg-navy-100 text-navy-700 dark:bg-navy-800 dark:text-navy-200',
};

const categoryLabels = {
  TUTORING: 'Tutoring', DESIGN: 'Design', PHOTOGRAPHY: 'Photography', MOVING: 'Moving',
  CLEANING: 'Cleaning', TECH_SUPPORT: 'Tech Support', WRITING: 'Writing', FITNESS: 'Fitness',
  MUSIC: 'Music', OTHER: 'Other',
};

const pricingUnits = { HOURLY: '/hr', FIXED: '', FREE: '' };

/**
 * Listing Card — displays a service with image or category banner, title,
 * price, rating, provider snippet, and an action button at the bottom.
 */
export default function ListingCard({
  image,
  title,
  description,
  category,
  price,
  pricingType = 'FIXED',
  rating = 0,
  reviewCount = 0,
  provider, // { firstName, lastName, avatarUrl, university }
  onClick,
  className = '',
  actionLabel = 'View Listing',
}) {
  const Wrapper = onClick ? 'button' : 'div';

  // Find category metadata from the global list
  const catInfo = CATEGORIES.find((c) => c.id === category);
  const catLabel = catInfo ? catInfo.name : (categoryLabels[category] || category);

  // Set category colors. Fallback to older presets if not in the 18 new categories
  const catStyle = catInfo ? {
    color: catInfo.color,
    backgroundColor: `${catInfo.color}15`,
  } : null;

  const priceDisplay =
    pricingType === 'FREE'
      ? 'Free'
      : `$${Number(price).toFixed(0)}${pricingUnits[pricingType]}`;

  return (
    <Wrapper
      onClick={onClick}
      className={[
        'group surface rounded-2xl overflow-hidden w-full text-left flex flex-col',
        'transition-all duration-200 ease-out h-full',
        onClick
          ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-[var(--border-strong)] focus-ring'
          : '',
        className,
      ].join(' ')}
    >
      {/* Image or Category Color Banner */}
      <div className="relative h-44 sm:h-48 overflow-hidden w-full flex-shrink-0">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center transition-colors duration-300"
            style={{
              background: catInfo
                ? `linear-gradient(135deg, ${catInfo.color}33, ${catInfo.color}66)`
                : 'linear-gradient(135deg, var(--color-primary-500)33, var(--color-secondary-500)33)',
            }}
          >
            <span
              className="text-6xl font-black opacity-30 select-none"
              style={{ color: catInfo ? catInfo.color : 'var(--color-primary-500)' }}
            >
              {catLabel[0]}
            </span>
          </div>
        )}
        {/* Price tag overlay */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-lg text-sm font-bold bg-navy-950/80 text-white backdrop-blur-sm shadow-md">
          {priceDisplay}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category badge */}
          {catStyle ? (
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2"
              style={catStyle}
            >
              {catLabel}
            </span>
          ) : (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 ${
                categoryColors[category] || categoryColors.OTHER
              }`}
            >
              {catLabel}
            </span>
          )}

          <h3
            className="font-bold text-base sm:text-lg mb-1 line-clamp-1 group-hover:text-primary-500 transition-colors"
            style={{ color: 'var(--text-heading)' }}
          >
            {title}
          </h3>

          {description && (
            <p
              className="text-sm line-clamp-2 mb-4"
              style={{ color: 'var(--text-muted)' }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Footer: provider + rating */}
        <div className="w-full">
          <div className="flex items-center justify-between pt-3 border-t border-[var(--border-default)]">
            {provider && (
              <div className="flex items-center gap-2 min-w-0">
                <Avatar
                  src={provider.avatarUrl}
                  name={`${provider.firstName} ${provider.lastName}`}
                  size="sm"
                />
                <span
                  className="text-sm truncate font-medium"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {provider.firstName} {provider.lastName?.[0]}.
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const providerId = provider.id || provider.userId;
                    if (providerId) {
                      window.location.href = `/messages?providerId=${providerId}`;
                    }
                  }}
                  className="p-1 rounded-lg hover:bg-[var(--bg-muted)] text-primary-500 cursor-pointer flex-shrink-0 transition-colors inline-flex items-center"
                  title="Message Provider"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </span>
              </div>
            )}

            {rating > 0 ? (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="w-3.5 h-3.5 text-accent-400 fill-accent-400" />
                <span
                  className="text-sm font-semibold"
                  style={{ color: 'var(--text-heading)' }}
                >
                  {Number(rating).toFixed(1)}
                </span>
                {reviewCount > 0 && (
                  <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                    ({reviewCount})
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="w-3.5 h-3.5 text-slate-300 fill-none" />
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                  No reviews
                </span>
              </div>
            )}
          </div>

          {/* Action Button */}
          {actionLabel && (
            <div className="mt-4 pt-3 border-t border-[var(--border-default)]">
              <div
                className="w-full text-center py-2 px-4 rounded-xl font-bold text-sm transition-colors"
                style={{
                  backgroundColor: 'var(--color-primary-500)',
                  color: 'white',
                }}
              >
                {actionLabel}
              </div>
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
}
