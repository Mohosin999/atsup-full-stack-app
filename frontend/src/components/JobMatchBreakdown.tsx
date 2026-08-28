import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Target,
  Sparkles,
} from "lucide-react";
import { AtsScoreHistory } from "../types";

interface JobMatchBreakdownProps {
  matchBreakdown: NonNullable<AtsScoreHistory["sectionScores"]>["matchBreakdown"];
}

interface CategorySectionProps {
  title: string;
  color: string;
  category: { score: number; matched: string[]; missing: string[]; items?: { item: string; status: string }[] };
  hint: string;
}

const SkillsTable: React.FC<{
  items: { item: string; status: string }[];
}> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full min-w-[300px] text-sm border-collapse">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
            <th className="py-2 pr-3 font-medium">Skill</th>
            <th className="py-2 px-3 font-medium text-center">Resume</th>
            <th className="py-2 pl-3 font-medium text-center">Job Description</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.item}
              className="border-b border-gray-100 dark:border-gray-700 last:border-b-0"
            >
              <td className="py-2.5 pr-3 text-gray-800 dark:text-gray-100 font-medium break-words">
                {item.item}
              </td>
              <td className="py-2.5 px-3 text-center">
                {item.status === "matched" ? (
                  <span
                    className="inline-flex w-6 h-6 rounded-full bg-cyan-500/15 text-cyan-600 items-center justify-center"
                    title={`${item.item} found in resume`}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </span>
                ) : (
                  <span
                    className="inline-flex w-6 h-6 rounded-full bg-red-500/15 text-red-600 items-center justify-center"
                    title={`${item.item} missing from resume`}
                  >
                    <XCircle className="w-4 h-4" />
                  </span>
                )}
              </td>
              <td className="py-2.5 pl-3 text-center">
                <span
                  className="inline-flex w-6 h-6 rounded-full bg-cyan-500/15 text-cyan-600 items-center justify-center"
                  title="Required by the job description"
                >
                  <CheckCircle className="w-4 h-4" />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  color,
  category,
  hint,
}) => {
  const total = category.matched.length + category.missing.length;
  const matchedCount = category.matched.length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-5">
      <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${color}`} />
          {title}
        </h3>
        <span className="text-xl font-bold text-gray-800 dark:text-gray-100">{category.score}%</span>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{hint}</p>

      <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${category.score}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full ${color}`}
          />
        </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {matchedCount}/{total} matched
          </span>
      </div>

      {category.items && category.items.length > 0 ? (
        <SkillsTable items={category.items} />
      ) : (
        <div className="flex flex-wrap gap-2">
          {category.matched.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border bg-cyan-500/10 text-cyan-600 border-cyan-500/30"
            >
              <CheckCircle className="w-3 h-3" />
              {item}
            </span>
          ))}
          {category.missing.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border bg-red-500/10 text-red-600 border-red-500/30"
            >
              <XCircle className="w-3 h-3" />
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const JobMatchBreakdown: React.FC<JobMatchBreakdownProps> = ({
  matchBreakdown,
}) => {
  if (!matchBreakdown) return null;

  const { hardSkills, softSkills } = matchBreakdown;

  const categoryConfigs = [
    {
      label: "Hard Skills",
      color: "bg-cyan-500",
      hint: "Technical skills and keywords the job asks for",
      category: hardSkills,
    },
    {
      label: "Soft Skills",
      color: "bg-blue-500",
      hint: "Interpersonal skills the job asks for",
      category: softSkills,
    },
  ];

  const categories = categoryConfigs.filter(
    (c) => c.category.matched.length + c.category.missing.length > 0,
  );

  if (categories.length === 0) return null;

  const allMissing = categories.flatMap((c) => c.category.missing);
  const matchedTotal = categories.reduce(
    (sum, c) => sum + c.category.matched.length,
    0,
  );
  const totalItems = categories.reduce(
    (sum, c) => sum + c.category.matched.length + c.category.missing.length,
    0,
  );

  const avgScore = Math.round(
    categories.reduce((sum, c) => sum + c.category.score, 0) /
      categories.length,
  );

  const verdict =
    avgScore >= 80
      ? {
          icon: <Sparkles className="w-5 h-5 text-cyan-600" />,
          text: "Excellent match! Your resume aligns strongly with this job description.",
          color: "text-cyan-600",
        }
      : avgScore >= 60
        ? {
            icon: <Target className="w-5 h-5 text-yellow-600" />,
            text: "Good match. A few tweaks will make your resume stand out for this role.",
            color: "text-yellow-600",
          }
        : {
            icon: <AlertCircle className="w-5 h-5 text-red-600" />,
            text: "Your resume needs work to compete for this role. Focus on the gaps below.",
            color: "text-red-600",
          };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-500" />
          Job Description Match
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">{avgScore}%</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">overall match</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center gap-3">
        {verdict.icon}
        <p className={`font-medium ${verdict.color}`}>{verdict.text}</p>
      </div>

      {matchedTotal > 0 && (
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-cyan-600 mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">What you did well</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            You matched {matchedTotal} of {totalItems} items from the job
            description.
          </p>
        </div>
      )}

      {allMissing.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-600 mb-2">
            <Target className="w-4 h-4" />
            <span className="font-medium">How to improve</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {allMissing.slice(0, 5).join(", ")} are required by the job but
            missing from your resume. Add them to your skills section and
            provide examples where you used them.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <CategorySection
            key={c.label}
            title={c.label}
            color={c.color}
            category={c.category}
            hint={c.hint}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default JobMatchBreakdown;
