import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Wrench,
  Users,
  UserCheck,
  LayoutTemplate,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MinusCircle,
} from "lucide-react";
import { CategoryResult, CategorySubgroup, CheckStatus } from "../../types";

const CATEGORY_META: Record<
  string,
  { icon: React.ReactNode; iconColor: string; accent: string }
> = {
  searchability: {
    icon: <Search className="w-5 h-5" />,
    iconColor: "bg-sky-500/15 text-sky-400",
    accent: "border-sky-500/40",
  },
  hardSkills: {
    icon: <Wrench className="w-5 h-5" />,
    iconColor: "bg-green-500/15 text-green-600",
    accent: "border-green-500/40",
  },
  softSkills: {
    icon: <Users className="w-5 h-5" />,
    iconColor: "bg-purple-500/15 text-purple-600",
    accent: "border-purple-500/40",
  },
  recruiterTips: {
    icon: <UserCheck className="w-5 h-5" />,
    iconColor: "bg-orange-500/15 text-orange-600",
    accent: "border-orange-500/40",
  },
  formatting: {
    icon: <LayoutTemplate className="w-5 h-5" />,
    iconColor: "bg-pink-500/15 text-pink-400",
    accent: "border-pink-500/40",
  },
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
};

const STATUS_ICON: Record<
  CheckStatus,
  { icon: React.ReactNode; color: string; mark: string }
> = {
  passed: {
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: "text-green-600",
    mark: "✓",
  },
  failed: {
    icon: <XCircle className="w-5 h-5" />,
    color: "text-red-600",
    mark: "✗",
  },
  "not-applicable": {
    icon: <MinusCircle className="w-5 h-5" />,
    color: "text-gray-500",
    mark: "–",
  },
};

// ==========================================================================
// Sub group block component (contact, section heading etc...)
// ==========================================================================
const SubgroupBlock: React.FC<{ subgroup: CategorySubgroup }> = ({
  subgroup,
}) => {
  return (
    <div className="rounded-xl border border-gray-200/60 bg-gray-100 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-200/60">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 leading-tight">
            {subgroup.title}
          </h4>
        </div>
      </div>

      <ul className="px-4 py-2.5 space-y-2.5">
        {subgroup.checks.map((check) => {
          const st = STATUS_ICON[check.status] || STATUS_ICON["not-applicable"];
          return (
            <li key={check.label} className="flex items-start gap-2.5">
              <span
                className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border ${
                  check.status === "passed"
                    ? "border-green-500/40 bg-green-500/15 text-green-600"
                    : check.status === "failed"
                      ? "border-red-500/40 bg-red-500/15 text-red-600"
                      : "border-gray-300/40 bg-gray-50 text-gray-500"
                }`}
              >
                <span className="text-[16px] leading-none">{st.mark}</span>
              </span>
              <div className="min-w-0">
                {/* <p className="text-[13px] font-medium text-gray-700 leading-snug">
                  {check.label}
                </p> */}
                <p className="text-xs text-gray-600 leading-snug mt-0.5">
                  {check.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const SeenMoreLimit = 10;

// ==========================================================================
// Skills table (hard and soft skills display)
// ==========================================================================
const SkillsTable: React.FC<{
  skills: { item: string; status: string }[];
}> = ({ skills }) => {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? skills : skills.slice(0, SeenMoreLimit);
  const remaining = skills.length - SeenMoreLimit;

  return (
    <div>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full min-w-[300px] text-sm border-collapse">
          <thead>
            <tr className="text-left text-xs tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <th className="py-2 px-5 font-medium">Skill</th>
              <th className="py-2 px-5 font-medium text-center">Resume</th>
              <th className="py-2 px-5 font-medium text-center">
                Job Description
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((s) => (
              <tr
                key={s.item}
                className="border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <td className="py-2.5 pl-5 pr-2 text-xs text-gray-800 dark:text-gray-200 break-words">
                  {s.item}
                </td>
                <td className="py-2.5 px-2 text-center">
                  {s.status === "matched" ? (
                    <span
                      className="inline-flex w-6 h-6 rounded-full bg-green-500/15 text-green-600 items-center justify-center"
                      title={`${s.item} found in resume`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  ) : (
                    <span
                      className="inline-flex w-6 h-6 rounded-full bg-red-500/15 text-red-600 items-center justify-center"
                      title={`${s.item} missing from resume`}
                    >
                      <XCircle className="w-4 h-4" />
                    </span>
                  )}
                </td>
                <td className="py-2.5 pr-5 pl-2 text-center">
                  <span
                    className="inline-flex w-6 h-6 rounded-full bg-green-500/15 text-green-600 items-center justify-center"
                    title="Required by the job description"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {skills.length > SeenMoreLimit && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 py-2 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          {showAll ? "See Less" : `See More (${remaining} more)`}
        </button>
      )}
    </div>
  );
};

// ==========================================================================
// Feedback card component (searchability, hard skills etc..)
// ==========================================================================
const FeedbackCard: React.FC<{ category: CategoryResult; index: number }> = ({
  category,
  index,
}) => {
  const meta = CATEGORY_META[category.key] || CATEGORY_META.hardSkills;
  const hasSkillChips =
    (category.matched && category.matched.length > 0) ||
    (category.missing && category.missing.length > 0);
  const hasSubgroups = !!category.subgroups && category.subgroups.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`bg-white/80 rounded-2xl ${meta.accent} p-5 box-shadow`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${meta.iconColor}`}
          >
            {meta.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 leading-tight">
              {category.title}
            </h3>
            <p className="text-xs text-gray-500">{category.summary}</p>
          </div>
        </div>
        {/* <span className={`text-base font-bold ${getScoreColor(category.score)}`}>
          {category.score}%
        </span> */}
      </div>

      {/* Sub-group breakdown (e.g. Searchability) */}
      {hasSubgroups && (
        <div className="space-y-3 mb-4">
          {category.subgroups!.map((subgroup) => (
            <SubgroupBlock key={subgroup.key} subgroup={subgroup} />
          ))}
        </div>
      )}

      {/* Skills table */}
      {hasSkillChips && (
        <div className="mb-4">
          <SkillsTable
            skills={[
              ...(category.matched?.map((item) => ({
                item,
                status: "matched",
              })) || []),
              ...(category.missing?.map((item) => ({
                item,
                status: "missing",
              })) || []),
            ]}
          />
        </div>
      )}

      {/* Strengths */}
      {!hasSubgroups && category.strengths.length > 0 && (
        <div className="mb-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-green-600 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            What you did well
          </p>
          <ul className="space-y-1.5">
            {category.strengths.slice(0, 4).map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-[13px] text-gray-700"
              >
                <span className="text-green-500 mt-0.5">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {/* {!hasSubgroups && category.improvements.length > 0 && (
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            How to improve
          </p>
          <ul className="space-y-1.5">
            {category.improvements.slice(0, 4).map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-[13px] text-gray-700"
              >
                <span className="text-amber-500 mt-0.5">→</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )} */}
    </motion.div>
  );
};

export default FeedbackCard;
