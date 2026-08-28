/* ===================================
ATS Score Breakdown Component
Displays ATS compatibility score with industry-standard metrics
=================================== */
import { FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ATSBreakdownItem {
  label: string;
  score: number;
  details: string;
  info?: string;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-cyan-500";
  if (score >= 60) return "text-blue-500";
  if (score >= 40) return "text-yellow-500";
  return "text-red-500";
};

const getScoreBg = (score: number) => {
  if (score >= 80) return "bg-gradient-to-br from-cyan-500 to-cyan-600";
  if (score >= 60) return "bg-gradient-to-br from-blue-500 to-indigo-600";
  if (score >= 40) return "bg-gradient-to-br from-yellow-500 to-orange-600";
  return "bg-gradient-to-br from-red-500 to-rose-600";
};

const getScoreBadge = (score: number) => {
  if (score >= 80) return { label: "Excellent", class: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-600" };
  if (score >= 60) return { label: "Good", class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
  if (score >= 40) return { label: "Fair", class: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-600" };
  return { label: "Needs Work", class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-600" };
};

interface ATSItemProps {
  item: ATSBreakdownItem;
  index: number;
}

const ATSItem = ({ item, index }: ATSItemProps) => {
  const badge = getScoreBadge(item.score);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-4 bg-gray-50 dark:bg-gray-800/70 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {item.score >= 70 ? (
            <CheckCircle2 className="w-4 h-4 text-cyan-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-yellow-500" />
          )}
           <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badge.class}`}>
            {badge.label}
          </span>
          <span className={`text-sm font-bold ${getScoreColor(item.score)}`}>
            {item.score}%
          </span>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5 mb-2">
        <motion.div
          className={`h-2.5 rounded-full ${getScoreBg(item.score)}`}
          initial={{ width: 0 }}
          animate={{ width: `${item.score}%` }}
          transition={{ duration: 0.8, delay: index * 0.1 }}
        />
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400">{item.details}</p>
      {item.info && (
        <p className="text-xs text-primary/80 mt-1">{item.info}</p>
      )}
    </motion.div>
  );
};

interface ATSScoreBreakdownProps {
  atsScore: number;
  breakdown: ATSBreakdownItem[];
  suggestions: string[];
}

export default function ATSScoreBreakdown({ atsScore, breakdown, suggestions }: ATSScoreBreakdownProps) {
  const overallBadge = getScoreBadge(atsScore);

  return (
    <div className="space-y-6">
      {/* ATS Score Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/5"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">ATS Compatibility Score</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">How well your resume passes Applicant Tracking Systems</p>
          </div>
        </div>

        <div className="flex items-end gap-4">
          <div className={`text-6xl font-bold ${getScoreColor(atsScore)}`}>
            {atsScore}%
          </div>
          <div className="mb-2">
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${overallBadge.class}`}>
              {overallBadge.label}
            </span>
          </div>
        </div>

        <div className="mt-4 p-4 bg-white/50 dark:bg-gray-800 rounded-lg border border-primary/20">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Industry Standard:</strong> Aim for 80%+ to pass most ATS filters. 
            {atsScore >= 80 
              ? " Your resume is well-optimized for ATS systems." 
              : atsScore >= 60
              ? " Your resume has good ATS compatibility but can be improved."
              : " Your resume needs optimization to pass ATS filters."}
          </p>
        </div>
      </motion.div>

      {/* ATS Breakdown Items */}
      <div className="grid gap-3">
        {breakdown.map((item, index) => (
          <ATSItem key={index} item={item} index={index} />
        ))}
      </div>

      {/* ATS Suggestions */}
      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6 border-l-4 border-l-primary"
        >
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">ATS Optimization Tips</h3>
          </div>
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                 className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{suggestion}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
