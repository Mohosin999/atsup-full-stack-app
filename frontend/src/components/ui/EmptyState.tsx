import { ReactNode, ComponentType } from 'react';
import { clsx } from 'clsx';

interface EmptyStateProps {
  icon?: ComponentType<{ className?: string }>;
  iconSize?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  iconSize = 'w-12 h-12',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center py-12',
        className
      )}
    >
      {Icon && (
        <div className="mb-4 text-gray-700 dark:text-gray-600">
          <Icon className={iconSize} />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-500 dark:text-gray-600 mb-6 max-w-md">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
