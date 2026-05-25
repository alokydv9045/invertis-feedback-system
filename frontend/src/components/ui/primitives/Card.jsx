import React from 'react';

const cardVariants = {
  elevated: 'bg-[var(--bg-surface)] border border-[var(--border-divider)] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300',
  flat: 'bg-[var(--bg-surface)] border border-[var(--border-divider)]',
  outlined: 'border-2 border-[var(--border-divider)] bg-transparent',
  glass: 'bg-[var(--glass-bg)]/80 backdrop-blur-md border border-[var(--border-divider)]/50 shadow-lg',
};

const paddingSizes = {
  compact: 'p-4',
  normal: 'p-6',
  spacious: 'p-8',
};

export const Card = React.forwardRef(
  (
    {
      variant = 'elevated',
      padding = 'normal',
      interactive = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`rounded-2xl ${cardVariants[variant]} ${paddingSizes[padding]} ${
          interactive ? 'cursor-pointer hover:scale-105' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
