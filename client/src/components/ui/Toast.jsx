import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

const config = {
  success: {
    icon: CheckCircle2,
    bar: 'bg-success-500',
    iconColor: 'text-success-500',
    bg: 'bg-success-50 dark:bg-success-700/10',
    border: 'border-success-200 dark:border-success-700/30',
  },
  error: {
    icon: XCircle,
    bar: 'bg-error-500',
    iconColor: 'text-error-500',
    bg: 'bg-error-50 dark:bg-error-700/10',
    border: 'border-error-200 dark:border-error-700/30',
  },
  warning: {
    icon: AlertTriangle,
    bar: 'bg-warning-500',
    iconColor: 'text-warning-500',
    bg: 'bg-warning-50 dark:bg-warning-700/10',
    border: 'border-warning-200 dark:border-warning-700/30',
  },
};

function ToastItem({ toast, onRemove }) {
  const { icon: Icon, bar, iconColor, bg, border } = config[toast.type] || config.success;

  return (
    <div
      className={[
        'relative overflow-hidden rounded-xl border shadow-lg',
        'flex items-start gap-3 px-4 py-3 min-w-[320px] max-w-md',
        bg,
        border,
        toast.exiting ? 'animate-toast-exit' : 'animate-toast-enter',
      ].join(' ')}
      role="alert"
    >
      {/* Color bar */}
      <div className={`absolute top-0 left-0 w-full h-[3px] ${bar}`} />

      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} />

      <p
        className="flex-1 text-sm font-medium"
        style={{ color: 'var(--text-body)' }}
      >
        {toast.message}
      </p>

      <button
        onClick={() => onRemove(toast.id)}
        className="p-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
      </button>
    </div>
  );
}

/**
 * Renders the toast stack. Place once in the app tree (e.g. in App.jsx).
 */
export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2.5">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}
