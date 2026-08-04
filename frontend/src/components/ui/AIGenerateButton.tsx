import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface AIGenerateButtonProps {
  onClick: () => void;
  loading?: boolean;
  label?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

const AIGenerateButton: React.FC<AIGenerateButtonProps> = ({
  onClick,
  loading = false,
  label = 'AI Generate',
  variant = 'primary',
  size = 'md',
}) => {
  const baseClasses =
    'inline-flex items-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white focus:ring-purple-500',
    secondary:
      'bg-gray-100 dark:bg-gray-100 hover:bg-gray-200 dark:hover:bg-gray-200 text-gray-900 dark:text-white focus:ring-gray-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        loading ? 'opacity-70 cursor-not-allowed' : ''
      }`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4" />
      )}
      {loading ? 'Generating...' : label}
    </button>
  );
};

export default AIGenerateButton;
