import React from 'react';
import { AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

interface SuggestionListProps {
  suggestions: string[];
  title?: string;
  type?: 'suggestion' | 'warning' | 'success';
}

const SuggestionList: React.FC<SuggestionListProps> = ({
  suggestions,
  title = 'Suggestions',
  type = 'suggestion',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Lightbulb className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'warning':
        return 'border-yellow-500';
      case 'success':
        return 'border-green-500';
      default:
        return 'border-blue-500';
    }
  };

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className={`border-l-4 ${getBorderColor()} bg-gray-50 dark:bg-gray-100 rounded-r-lg p-4`}>
      <div className="flex items-center gap-2 mb-3">
        {getIcon()}
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <ul className="space-y-2">
        {suggestions.map((suggestion, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-700"
          >
            <span className="text-blue-500 mt-1">•</span>
            <span>{suggestion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SuggestionList;
