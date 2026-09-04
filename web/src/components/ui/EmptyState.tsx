import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-surface-hover)]/50 ${className}`}>
      <div className="p-4 rounded-2xl bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)] shadow-sm mb-4">
        {icon}
      </div>
      <h4 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-1">
        {title}
      </h4>
      {description && (
        <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-sm mb-6">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
