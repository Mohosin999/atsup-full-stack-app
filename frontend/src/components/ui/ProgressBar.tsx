import React from "react";
import { motion } from "framer-motion";

interface ProgressBarProps {
  progress: number;
  label?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "success" | "warning" | "danger";
  animated?: boolean;
}

const getColorClasses = (
  color: "primary" | "success" | "warning" | "danger",
) => {
  switch (color) {
    case "success":
      return "bg-cyan-500";
    case "warning":
      return "bg-yellow-500";
    case "danger":
      return "bg-red-500";
    default:
      return "bg-primary";
  }
};

const getSizeClasses = (size: "sm" | "md" | "lg") => {
  switch (size) {
    case "sm":
      return "h-1";
    case "lg":
      return "h-4";
    default:
      return "h-2";
  }
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = false,
  size = "md",
  color = "primary",
  animated = true,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {label}
            </span>
          )}
          {showPercentage && (
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full ${getSizeClasses(
          size,
        )} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}
      >
        <motion.div
          initial={animated ? { width: 0 } : { width: `${clampedProgress}%` }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full ${getColorClasses(color)} rounded-full`}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
