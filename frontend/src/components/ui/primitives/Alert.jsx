import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const alertVariants = {
  success: {
    bg: 'bg-emerald-500/15 dark:bg-emerald-950/30',
    border: 'border-emerald-500/30 dark:border-emerald-700',
    text: 'text-emerald-700 dark:text-emerald-300',
    icon: CheckCircle,
  },
  error: {
    bg: 'bg-accent-500/15 dark:bg-red-950/30',
    border: 'border-accent-500/30 dark:border-red-700',
    text: 'text-accent-700 dark:text-accent-300',
    icon: AlertCircle,
  },
  warning: {
    bg: 'bg-amber-500/15 dark:bg-amber-950/30',
    border: 'border-amber-500/30 dark:border-amber-700',
    text: 'text-amber-700 dark:text-amber-300',
    icon: AlertTriangle,
  },
  info: {
    bg: 'bg-blue-500/15 dark:bg-blue-950/30',
    border: 'border-blue-500/30 dark:border-blue-700',
    text: 'text-blue-700 dark:text-blue-300',
    icon: Info,
  },
};

export const Alert = React.forwardRef(
  (
    {
      variant = 'info',
      title = '',
      closeable = false,
      className = '',
      children,
      onClose = () => {},
      ...props
    },
    ref
  ) => {
    const [closed, setClosed] = React.useState(false);

    if (closed) return null;

    const config = alertVariants[variant];
    const Icon = config.icon;

    const handleClose = () => {
      setClosed(true);
      onClose();
    };

    return (
      <div
        ref={ref}
        className={`border rounded-lg p-4 flex gap-3 ${config.bg} ${config.border} ${config.text} ${className}`}
        {...props}
      >
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          {title && <h4 className="font-semibold mb-1">{title}</h4>}
          <p className="text-sm">{children}</p>
        </div>
        {closeable && (
          <button
            onClick={handleClose}
            className="text-[inherit] hover:opacity-70 transition-opacity flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';
