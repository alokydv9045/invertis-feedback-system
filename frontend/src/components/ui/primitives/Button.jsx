import React from 'react';
import { Loader2 } from 'lucide-react';

const buttonVariants = {
  primary: 'bg-gradient-to-r from-primary-700 via-primary-600 to-[#FF2A00] text-white hover:shadow-lg hover:-translate-y-0.5 focus:ring-2 focus:ring-[var(--border-focus)] focus:ring-offset-2',
  secondary: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:text-primary-300 dark:border-primary-400 dark:hover:bg-primary-900/20 focus:ring-2 focus:ring-primary-600 focus:ring-offset-2',
  tertiary: 'text-primary-600 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 focus:ring-2 focus:ring-primary-600 focus:ring-offset-2',
  danger: 'bg-[#FF2A00] text-white hover:bg-[#CC2200] focus:ring-2 focus:ring-[#FF2A00] focus:ring-offset-2',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
  ghost: 'text-primary-600 dark:text-primary-300 hover:bg-gray-100 dark:hover:bg-gray-900 focus:ring-2 focus:ring-primary-600',
};

const buttonSizes = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

export const Button = React.forwardRef(
  (
    {
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      fullWidth = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:pointer-events-none focus:outline-none
          ${buttonVariants[variant]}
          ${buttonSizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${loading ? 'pointer-events-none' : ''}
          ${className}`}
        {...props}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
