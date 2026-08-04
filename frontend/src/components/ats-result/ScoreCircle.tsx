import React, { useId } from "react";
import { motion } from "framer-motion";

interface ScoreCircleProps {
  score: number;
  label: string;
  sublabel?: string;
  size?: "sm" | "md" | "lg";
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
};

const getBadge = (score: number) => {
  if (score >= 80) return { label: "Excellent", class: "bg-green-50 text-green-700 border-green-200" };
  if (score >= 60) return { label: "Good", class: "bg-yellow-50 text-yellow-700 border-yellow-200" };
  if (score >= 40) return { label: "Fair", class: "bg-orange-50 text-orange-700 border-orange-200" };
  return { label: "Needs Work", class: "bg-red-50 text-red-700 border-red-200" };
};

const ScoreCircle: React.FC<ScoreCircleProps> = ({
  score,
  label,
  sublabel,
  size = "md",
}) => {
  const gradId = useId();
  const sizePx = size === "lg" ? 210 : size === "sm" ? 120 : 160;
  const strokeWidth = size === "lg" ? 15 : size === "sm" ? 9 : 11;
  const radius = (sizePx - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const color = getScoreColor(score);
  const badge = getBadge(score);
  const textSize = size === "lg" ? "text-5xl" : size === "sm" ? "text-2xl" : "text-4xl";

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <div className="relative inline-flex items-center justify-center">
        <svg width={sizePx} height={sizePx} className="-rotate-90">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
          </defs>
          <circle
            cx={sizePx / 2}
            cy={sizePx / 2}
            r={radius}
            fill="none"
            stroke="rgba(0,0,0,0.08)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={sizePx / 2}
            cy={sizePx / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className={`${textSize} font-bold text-gray-900`}
          >
            {score}
            <span className="text-2xl font-semibold text-gray-600">%</span>
          </motion.span>
          <span className={`mt-1 px-2 py-0.5 text-[11px] font-medium rounded-full border ${badge.class}`}>
            {badge.label}
          </span>
        </div>
      </div>
      <p className="mt-3 text-sm font-medium text-gray-700">{label}</p>
      {sublabel && <p className="text-xs text-gray-500">{sublabel}</p>}
    </div>
  );
};

export default ScoreCircle;
