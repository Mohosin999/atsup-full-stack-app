import React from "react";
import { motion } from "framer-motion";

interface ScoreCircleProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

const getScoreColor = (score: number) => {
  if (score < 40) return "#9CA3AF"; // Full Gray
  if (score < 70) return "#F59E0B"; // Amber/Yellow
  return "#32BE7E"; // Green
};

const getThickness = (size: string) => {
  switch (size) {
    case "sm":
      return 12;
    case "lg":
      return 20;
    default:
      return 16;
  }
};

const ScoreCircle: React.FC<ScoreCircleProps> = ({
  score,
  label,
  size = "md",
}) => {
  const sizePx = size === "lg" ? 220 : size === "sm" ? 140 : 180;
  const strokeWidth = getThickness(size);
  const radius = (sizePx - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const color = getScoreColor(score);

  const textSize =
    size === "lg" ? "text-6xl" : size === "sm" ? "text-3xl" : "text-4xl";

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      {/* <p className="mb-4 text-base lg:text-lg font-semibold text-gray-700">
        {label}
      </p> */}

      <div className="relative inline-flex items-center justify-center">
        <svg width={sizePx} height={sizePx} className="-rotate-90">
          {/* Background Circle */}
          <circle
            cx={sizePx / 2}
            cy={sizePx / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />

          {/* Score Circle - Solid Color */}
          <motion.circle
            cx={sizePx / 2}
            cy={sizePx / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Inner Shadow Effect */}
          <circle
            cx={sizePx / 2}
            cy={sizePx / 2}
            r={radius - 1}
            fill="none"
            stroke="rgba(0,0,0,0.05)"
            strokeWidth={strokeWidth + 4}
          />
        </svg>

        {/* Score Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5, ease: "backOut" }}
            className="text-center"
          >
            <span className={`${textSize} font-bold text-gray-700 dark:text-gray-300`}>
              {score}
              <span className="text-xl font-semibold text-gray-500 dark:text-gray-400">%</span>
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCircle;
