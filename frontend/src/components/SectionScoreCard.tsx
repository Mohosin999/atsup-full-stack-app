import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface SectionScoreCardProps {
  sectionName: string;
  score: number;
  feedback: string;
  hasContactInfo?: boolean;
}

const SectionScoreCard: React.FC<SectionScoreCardProps> = ({
  sectionName,
  score,
  feedback,
  hasContactInfo,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20";
    if (score >= 60)
      return "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
    return "text-red-500 bg-red-50 dark:bg-red-900/20";
  };

  const getIcon = () => {
    if (hasContactInfo !== undefined) {
      return hasContactInfo ? (
        <CheckCircle className="w-5 h-5 text-cyan-500" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500" />
      );
    }
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-cyan-500" />;
    if (score >= 60) return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg p-4 ${getScoreColor(score)}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {getIcon()}
          <h3 className="font-semibold text-gray-800 dark:text-white">
            {sectionName}
          </h3>
        </div>
        <span className="text-2xl font-bold">{score}%</span>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-700">{feedback}</p>
    </motion.div>
  );
};

export default SectionScoreCard;
