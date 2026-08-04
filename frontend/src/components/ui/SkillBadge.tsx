import React from 'react';

interface SkillBadgeProps {
  skill: string;
  type?: 'matched' | 'missing' | 'neutral';
  onRemove?: () => void;
}

const getTypeClasses = (type: 'matched' | 'missing' | 'neutral') => {
  switch (type) {
    case 'matched':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-600 border-green-200 dark:border-green-800';
    case 'missing':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-600 border-red-200 dark:border-red-800';
    default:
      return 'bg-gray-100 dark:bg-gray-100 text-gray-700 dark:text-gray-700 border-gray-200 dark:border-gray-300';
  }
};

export const SkillBadge: React.FC<SkillBadgeProps> = ({
  skill,
  type = 'neutral',
  onRemove
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${getTypeClasses(
        type
      )}`}
    >
      {skill}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:opacity-70 transition-opacity"
        >
          ×
        </button>
      )}
    </span>
  );
};

interface SkillListProps {
  skills: string[];
  type?: 'matched' | 'missing' | 'neutral';
  maxDisplay?: number;
}

export const SkillList: React.FC<SkillListProps> = ({
  skills,
  type = 'neutral',
  maxDisplay = 15
}) => {
  if (!skills || skills.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-600">
        No skills to display
      </p>
    );
  }

  const displaySkills = skills.slice(0, maxDisplay);
  const remaining = skills.length - maxDisplay;

  return (
    <div className="flex flex-wrap gap-2">
      {displaySkills.map((skill) => (
        <SkillBadge key={skill} skill={skill} type={type} />
      ))}
      {remaining > 0 && (
        <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-600">
          +{remaining} more
        </span>
      )}
    </div>
  );
};

export default SkillBadge;
