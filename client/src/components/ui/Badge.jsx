import { CheckCircle2, Shield, Clock, XCircle, Star } from 'lucide-react';

const presets = {
  verified: {
    classes: 'bg-primary-100 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300',
    icon: CheckCircle2,
    label: 'Verified',
  },
  provider: {
    classes: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-950/40 dark:text-secondary-300',
    icon: Shield,
    label: 'Provider',
  },
  seeker: {
    classes: 'bg-accent-100 text-accent-700 dark:bg-accent-950/40 dark:text-accent-300',
    icon: Star,
    label: 'Seeker',
  },
  pending: {
    classes: 'bg-warning-100 text-warning-700 dark:bg-warning-700/20 dark:text-warning-300',
    icon: Clock,
    label: 'Pending',
  },
  active: {
    classes: 'bg-success-100 text-success-700 dark:bg-success-700/20 dark:text-success-300',
    icon: CheckCircle2,
    label: 'Active',
  },
  completed: {
    classes: 'bg-success-100 text-success-700 dark:bg-success-700/20 dark:text-success-300',
    icon: CheckCircle2,
    label: 'Completed',
  },
  cancelled: {
    classes: 'bg-error-100 text-error-700 dark:bg-error-700/20 dark:text-error-300',
    icon: XCircle,
    label: 'Cancelled',
  },
  rejected: {
    classes: 'bg-error-100 text-error-700 dark:bg-error-700/20 dark:text-error-300',
    icon: XCircle,
    label: 'Rejected',
  },
  accepted: {
    classes: 'bg-primary-100 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300',
    icon: CheckCircle2,
    label: 'Accepted',
  },
  default: {
    classes: 'bg-navy-100 text-navy-700 dark:bg-navy-800 dark:text-navy-200',
    icon: null,
    label: '',
  },
};

/**
 * Badge — renders a pill with an optional icon.
 * Use a `variant` preset or pass custom children.
 *
 * @param {'verified'|'provider'|'seeker'|'pending'|'active'|'completed'|'cancelled'|'rejected'|'accepted'|'default'} variant
 */
export default function Badge({
  variant = 'default',
  children,
  icon: CustomIcon,
  className = '',
  ...props
}) {
  const preset = presets[variant] || presets.default;
  const IconComponent = CustomIcon || preset.icon;
  const label = children || preset.label;

  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold',
        'transition-colors duration-200',
        preset.classes,
        className,
      ].join(' ')}
      {...props}
    >
      {IconComponent && <IconComponent className="w-3 h-3" />}
      {label}
    </span>
  );
}
