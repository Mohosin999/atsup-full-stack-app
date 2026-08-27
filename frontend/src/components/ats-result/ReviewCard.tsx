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
  MinusCircle,
  EyeOff,
} from "lucide-react";
import { CategoryResult, CategorySubgroup, CheckStatus } from "../../types";
import FormattingTipsModal from "./FormattingTipsModal";

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
// const SubgroupBlock: React.FC<{ subgroup: CategorySubgroup }> = ({
//   subgroup,
// }) => {
//   return (
//     <div className="rounded-xl border border-gray-200/60 bg-gray-0 overflow-hidden">
//       <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-200/60">
//         <div className="min-w-0">
//           <h4 className="text-sm font-semibold text-gray-800 leading-tight">
//             {subgroup.title}
//           </h4>
//         </div>
//       </div>

//       <ul className="px-4 py-2.5 space-y-2.5">
//         {subgroup.checks.map((check) => {
//           const st = STATUS_ICON[check.status] || STATUS_ICON["not-applicable"];
//           return (
//             <li key={check.label} className="flex items-start gap-2.5">
//               <span
//                 className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
//                   check.status === "passed"
//                     ? "bg-green-500/15 text-green-600"
//                     : check.status === "failed"
//                       ? "bg-red-500/15 text-red-600"
//                       : "bg-gray-50 text-gray-500"
//                 }`}
//               >
//                 <span className="text-[18px] xl:text-[20px] leading-none">
//                   {st.mark}
//                 </span>
//               </span>
//               <div className="min-w-0">
//                 <p className="text-[13px] font-medium text-gray-700 leading-snug">
//                   {check.label}
//                 </p>
//                 <p className="text-xs text-gray-600 leading-snug mt-0.5">
//                   {check.detail}
//                 </p>
//               </div>
//             </li>
//           );
//         })}
//       </ul>
//     </div>
//   );
// };

const SubgroupBlock: React.FC<{ subgroup: CategorySubgroup }> = ({
  subgroup,
}) => {
  return (
    <div className="border border-gray-200/60 bg-gray-0 overflow-hidden xl:flex xl:items-stretch">
      {/* Left side - Title with border on xl screens */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-200/60 xl:border-b-0 xl:border-r xl:w-64 xl:flex-shrink-0 xl:px-6 xl:py-4">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-gray-700 leading-tight">
            {subgroup.title}
          </h4>
        </div>
      </div>

      {/* Right side - Check items */}
      <ul className="px-4 py-2.5 space-y-2.5 xl:flex-1 xl:px-6 xl:py-4 xl:space-y-3">
        {subgroup.checks.map((check) => {
          const st = STATUS_ICON[check.status] || STATUS_ICON["not-applicable"];
          return (
            <li
              key={check.label}
              className="flex items-start gap-2.5 xl:gap-3 xl:items-center"
            >
              <span
                className={`mt-0.5 flex-shrink-0 w-5 h-5 flex items-center justify-center xl:mt-0 rounded-full ${
                  check.status === "passed"
                    ? "bg-green-500/15 text-green-600"
                    : check.status === "failed"
                      ? "bg-red-500/15 text-red-600"
                      : "bg-gray-50 text-gray-500"
                }`}
              >
                <span className="text-[16px] xl:text-[18px] leading-none">
                  {st.mark}
                </span>
              </span>
              <div className="min-w-0">
                {/* <p className="text-[13px] font-medium text-gray-700 leading-snug xl:text-sm">
                  {check.label}
                </p> */}
                <p className="text-xs text-gray-600 leading-snug mt-0.5 xl:text-[13px]">
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
                className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
              >
                <td className="py-4 pl-5 pr-2 text-xs text-gray-800 dark:text-gray-200 break-words">
                  {s.item}
                </td>
                <td className="py-2.5 px-2 text-center">
                  {s.status === "matched" ? (
                    <span
                      className="inline-flex text-[16px] xl:text-[18px] items-center justify-center text-green-600"
                      title={`${s.item} found in resume`}
                    >
                      ✓
                    </span>
                  ) : (
                    <span
                      className="inline-flex text-[16px] xl:text-[18px] items-center justify-center text-red-600"
                      title={`${s.item} missing from resume`}
                    >
                      ✗
                    </span>
                  )}
                </td>
                <td className="py-2.5 pr-5 pl-2 text-center">
                  <span
                    className="inline-flex text-[16px] xl:text-[18px] items-center justify-center text-green-600"
                    title="Required by the job description"
                  >
                    ✓
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
          className="mt-3 py-2 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {showAll ? "See Less" : `See More (${remaining} more)`}
        </button>
      )}
    </div>
  );
};

// ==========================================================================
// Formatting lock
// ==========================================================================
const isFormattingCategory = (key: string) => key === "formatting";

const FormattingLock: React.FC<{ onShowTips: () => void }> = ({
  onShowTips,
}) => {
  return (
    <div className="relative border border-green-500/30 bg-green-500/5 overflow-hidden">
      {/* Blurred content placeholder */}
      <div className="blur-[5px] select-none pointer-events-none p-4 opacity-60">
        <div className="space-y-3">
          <div className="bg-gray-100 p-4 space-y-2.5">
            <div className="w-24 h-4 bg-gray-300" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-5 h-5 bg-gray-300 flex-shrink-0" />
                <div className="flex-1 h-3 bg-gray-300" />
              </div>
            ))}
          </div>
          <div className="bg-gray-100 p-4 space-y-2.5">
            <div className="w-20 h-4 bg-gray-300" />
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-5 h-5 bg-gray-300 flex-shrink-0" />
                <div className="flex-1 h-3 bg-gray-300" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overlay text on top of blur */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 py-6">
        <p className="text-lg md:text-xl font-bold text-gray-800 leading-tight mb-1.5">
          Unavailable for Free
        </p>
        <p className="text-sm text-gray-700 mb-4 max-w-md">
          This section only works with AI scans. Get free tips to make your
          resume formatting perfect.
        </p>
        <button
          onClick={onShowTips}
          className="inline-flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-600/90 text-white text-sm font-semibold shadow-lg"
        >
          <EyeOff className="w-4 h-4" />
          Show Tips
        </button>
      </div>
    </div>
  );
};

const ReviewCard: React.FC<{
  category: CategoryResult;
  index: number;
  hasFormattingData?: boolean;
}> = ({ category, index, hasFormattingData = false }) => {
  const meta = CATEGORY_META[category.key] || CATEGORY_META.hardSkills;
  const hasSkillChips =
    (category.matched && category.matched.length > 0) ||
    (category.missing && category.missing.length > 0);
  const hasSubgroups = !!category.subgroups && category.subgroups.length > 0;
  const [tipsOpen, setTipsOpen] = useState(false);

  const content = (
    <>
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
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`bg-white/80 ${meta.accent} p-5 box-shadow`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 flex items-center justify-center ${meta.iconColor}`}
          >
            {meta.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 leading-tight">
              {category.title}
            </h3>
            <p className="text-xs text-gray-500">{category.summary}</p>
          </div>
        </div>
        {/* <span className={`text-sm font-bold ${getScoreColor(category.score)}`}>
          {category.score}%
        </span> */}
      </div>

      {isFormattingCategory(category.key) && !hasFormattingData ? (
        <FormattingLock onShowTips={() => setTipsOpen(true)} />
      ) : (
        content
      )}

      <FormattingTipsModal
        isOpen={tipsOpen}
        onClose={() => setTipsOpen(false)}
      />

      {/* Strengths */}
      {/* {!hasSubgroups && category.strengths.length > 0 && (
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
                <span className="text-green-600 mt-0.5">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )} */}

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

export default ReviewCard;
