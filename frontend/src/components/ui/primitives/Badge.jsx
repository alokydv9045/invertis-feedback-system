import React from 'react';

const badgeVariants = {
  primary: 'bg-primary-500/15 text-primary-600 dark:text-primary-300 border border-primary-500/30 dark:border-primary-500/40',
  secondary: 'bg-slate-500/15 text-slate-600 dark:text-slate-300 border border-slate-500/30 dark:border-slate-500/40',
  success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 dark:border-emerald-500/40',
  warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 dark:border-amber-500/40',
  error: 'bg-accent-500/15 text-accent-600 dark:text-accent-300 border border-accent-500/30 dark:border-accent-500/40',
  info: 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/30 dark:border-blue-500/40',
};

const badgeSizes = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

const roleColors = {
  supreme: 'bg-accent-500/15 text-accent-600 dark:text-accent-300 border border-accent-500/30',
  super_admin: 'bg-accent-500/15 text-accent-600 dark:text-accent-300 border border-accent-500/30',
  coordinator: 'bg-primary-500/15 text-primary-600 dark:text-primary-300 border border-primary-500/30',
  hod: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30',
  student: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30',
  faculty: 'bg-violet-500/15 text-violet-600 dark:text-violet-300 border border-violet-500/30',
  trainer: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30',
};

export const Badge = React.forwardRef(
  (
    {
      variant = 'primary',
      size = 'md',
      role = null,
      icon: Icon = null,
      dismissible = false,
      onDismiss = () => {},
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const [dismissed, setDismissed] = React.useState(false);

    if (dismissed) return null;

    const variantClass = role && roleColors[role] ? roleColors[role] : badgeVariants[variant];

    return (
      <span
        ref={ref}
        className={`inline-flex items-center gap-1.5 rounded-lg font-bold border transition-all duration-300 ${variantClass} ${badgeSizes[size]} ${className}`}
        {...props}
      >
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {children}
        {dismissible && (
          <button
            onClick={() => {
              setDismissed(true);
              onDismiss();
            }}
            className="ml-1 hover:opacity-70 transition-opacity"
          >
            ✕
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
