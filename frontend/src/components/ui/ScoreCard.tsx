import React from "react";
import { motion } from "framer-motion";

interface ScoreCardProps {
  score: number;
  label: string;
  sublabel?: string;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
  breakdown?: {
    label: string;
    score: number;
    weight: number;
  }[];
}

const getScoreColor = (score: number): string => {
  if (score >= 70) return "text-cyan-500";
  if (score >= 50) return "text-yellow-500";
  return "text-red-500";
};

const getScoreBg = (score: number): string => {
  if (score >= 70) return "bg-cyan-500";
  if (score >= 50) return "bg-yellow-500";
  return "bg-red-500";
};

const getSizeClasses = (size: "sm" | "md" | "lg") => {
  switch (size) {
    case "sm":
      return "text-2xl";
    case "lg":
      return "text-5xl";
    default:
      return "text-4xl";
  }
};

export const ScoreCard: React.FC<ScoreCardProps> = ({
  score,
  label,
  sublabel,
  size = "md",
  showProgress = false,
  breakdown,
}) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-100 rounded-lg p-4">
      <div className="text-center mb-2">
        <div
          className={`font-bold ${getSizeClasses(size)} ${getScoreColor(score)}`}
        >
          {score}%
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-700 mt-1">
          {label}
        </p>
        {sublabel && (
          <p className="text-xs text-gray-500 dark:text-gray-600">{sublabel}</p>
        )}
      </div>

      {showProgress && (
        <div className="mt-3">
          <div className="h-2 bg-gray-200 dark:bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full ${getScoreBg(score)}`}
            />
          </div>
        </div>
      )}

      {breakdown && breakdown.length > 0 && (
        <div className="mt-4 space-y-2">
          {breakdown.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-gray-600 dark:text-gray-600">
                {item.label}
              </span>
              <span className="font-medium text-gray-800 dark:text-white">
                {item.score}% ({item.weight}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScoreCard;
