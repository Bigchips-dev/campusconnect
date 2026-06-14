import { CheckCircle2, Shield, Clock, XCircle, Star } from 'lucide-react';

const presets = {
  verified: {
    classes: 'bg-[#FAFAFA] text-[#0A0A0A] border border-[#E5E7EB]',
    icon: CheckCircle2,
    label: 'Verified',
  },
  provider: {
    classes: 'bg-[#FAFAFA] text-[#0A0A0A] border border-[#E5E7EB]',
    icon: Shield,
    label: 'Provider',
  },
  seeker: {
    classes: 'bg-accent-100 text-accent-700',
    icon: Star,
    label: 'Seeker',
  },
  pending: {
    classes: 'bg-warning-100 text-warning-700',
    icon: Clock,
    label: 'Pending',
  },
  active: {
    classes: 'bg-success-100 text-success-700',
    icon: CheckCircle2,
    label: 'Active',
  },
  completed: {
    classes: 'bg-success-100 text-success-700',
    icon: CheckCircle2,
    label: 'Completed',
  },
  cancelled: {
    classes: 'bg-error-100 text-error-700',
    icon: XCircle,
    label: 'Cancelled',
  },
  rejected: {
    classes: 'bg-error-100 text-error-700',
    icon: XCircle,
    label: 'Rejected',
  },
  accepted: {
    classes: 'bg-[#0A0A0A] text-white',
    icon: CheckCircle2,
    label: 'Accepted',
  },
  default: {
    classes: 'bg-[#F3F4F6] text-[#6B7280]',
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
