import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  interactive = false,
  glass = false,
  className = '',
  ...props
}) => {
  const base = glass ? 'glass-card' : 'card';
  const interactiveClass = interactive ? 'card-interactive cursor-pointer' : '';

  return (
    <div className={`${base} ${interactiveClass} p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, icon, className = '' }) => {
  return (
    <div className={`flex items-start justify-between gap-3 pb-4 mb-4 border-b border-[var(--border-subtle)] ${className}`}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2.5 rounded-xl bg-[var(--primary-50)] dark:bg-[var(--primary-900)] text-[var(--primary-600)] dark:text-[var(--primary-400)] border border-[var(--primary-200)] dark:border-[var(--primary-800)]">
            {icon}
          </div>
        )}
        <div>
          <h3 className="font-bold text-base sm:text-lg text-[var(--text-primary)] tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};
