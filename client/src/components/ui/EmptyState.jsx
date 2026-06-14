import { Inbox } from 'lucide-react';
import Button from './Button';

/**
 * Empty state with illustration placeholder, title, description,
 * and optional action button.
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description = '',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className,
      ].join(' ')}
    >
      {/* Illustration circle */}
      <div className="relative mb-6">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--bg-surface-raised)' }}
        >
          <Icon className="w-10 h-10 text-[#F59E0B]" />
        </div>
        {/* Decorative ring */}
        <div className="absolute inset-0 w-24 h-24 rounded-full border-2 border-dashed border-[#E5E7EB] animate-[spin_20s_linear_infinite]" />
      </div>

      <h3
        className="text-lg font-bold mb-2"
        style={{ color: 'var(--text-heading)' }}
      >
        {title}
      </h3>

      {description && (
        <p className="text-sm max-w-xs mb-6" style={{ color: 'var(--text-muted)' }}>
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
