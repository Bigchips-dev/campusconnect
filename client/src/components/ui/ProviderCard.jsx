import { Star, BookOpen, Award } from 'lucide-react';
import Avatar from './Avatar';
import Badge from './Badge';

/**
 * Provider Card — displays provider profile summary with avatar,
 * name, rating, review count, service count, and verification badge.
 */
export default function ProviderCard({
  avatarSrc,
  name,
  university,
  rating = 0,
  reviewCount = 0,
  serviceCount = 0,
  verified = false,
  onClick,
  className = '',
}) {
  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      onClick={onClick}
      className={[
        'surface rounded-2xl p-5 sm:p-6 text-left w-full',
        'transition-all duration-200 ease-out',
        onClick
          ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:border-[var(--border-strong)] focus-ring'
          : '',
        className,
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar src={avatarSrc} name={name} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className="font-bold truncate"
              style={{ color: 'var(--text-heading)' }}
            >
              {name}
            </h3>
            {verified && <Badge variant="verified" />}
          </div>
          {university && (
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              {university}
            </p>
          )}
        </div>
      </div>

      {/* Rating */}
      {rating > 0 && (
        <div className="flex items-center gap-1.5 mb-4">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i <= Math.round(rating)
                    ? 'text-accent-400 fill-accent-400'
                    : 'text-[var(--border-default)]'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>
            {Number(rating).toFixed(1)}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            ({reviewCount})
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 pt-3 border-t border-[var(--border-default)]">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-[#F59E0B]" />
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            {serviceCount} {serviceCount === 1 ? 'service' : 'services'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[#F59E0B]" />
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
          </span>
        </div>
      </div>
    </Wrapper>
  );
}
