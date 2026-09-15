// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import {
//   Search,
//   Wrench,
//   Users,
//   UserCheck,
//   LayoutTemplate,
//   CheckCircle2,
//   XCircle,
//   MinusCircle,
//   EyeOff,
// } from "lucide-react";
// import { CategoryResult, CategorySubgroup, CheckStatus } from "../../types";
// import FormattingTipsModal from "./FormattingTipsModal";

// const CATEGORY_META: Record<
//   string,
//   { icon: React.ReactNode; iconColor: string; accent: string }
// > = {
//   searchability: {
//     icon: <Search className="w-5 h-5" />,
//     iconColor: "bg-sky-500/15 text-sky-400",
//     accent: "border-sky-500/40",
//   },
//   hardSkills: {
//     icon: <Wrench className="w-5 h-5" />,
//     iconColor: "bg-green-500/15 text-green-600",
//     accent: "border-green-500/40",
//   },
//   softSkills: {
//     icon: <Users className="w-5 h-5" />,
//     iconColor: "bg-purple-500/15 text-purple-600",
//     accent: "border-purple-500/40",
//   },
//   recruiterTips: {
//     icon: <UserCheck className="w-5 h-5" />,
//     iconColor: "bg-orange-500/15 text-orange-600",
//     accent: "border-orange-500/40",
//   },
//   formatting: {
//     icon: <LayoutTemplate className="w-5 h-5" />,
//     iconColor: "bg-pink-500/15 text-pink-400",
//     accent: "border-pink-500/40",
//   },
// };

// // const getScoreColor = (score: number) => {
// //   if (score >= 80) return "text-green-600";
// //   if (score >= 60) return "text-yellow-600";
// //   if (score >= 40) return "text-orange-600";
// //   return "text-red-600";
// // };

// const STATUS_ICON: Record<
//   CheckStatus,
//   { icon: React.ReactNode; color: string; mark: string }
// > = {
//   passed: {
//     icon: <CheckCircle2 className="w-5 h-5" />,
//     color: "text-green-600",
//     mark: "✓",
//   },
//   failed: {
//     icon: <XCircle className="w-5 h-5" />,
//     color: "text-red-600",
//     mark: "✗",
//   },
//   "not-applicable": {
//     icon: <MinusCircle className="w-5 h-5" />,
//     color: "text-gray-500",
//     mark: "–",
//   },
// };

// const SubgroupBlock: React.FC<{ subgroup: CategorySubgroup }> = ({
//   subgroup,
// }) => {
//   return (
//     <div className="border border-gray-200/60 dark:border-gray-700/60 bg-gray-0 overflow-hidden xl:flex xl:items-stretch">
//       {/* Left side - Title with border on xl screens */}
//       <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200/60 dark:border-gray-700/60 xl:border-b-0 xl:border-r xl:w-64 xl:flex-shrink-0 xl:px-6 xl:py-4">
//         <div className="min-w-0">
//           <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 leading-tight">
//             {subgroup.title}
//           </h4>
//         </div>
//       </div>

//       {/* Right side - Check items */}
//       <ul className="px-4 py-2.5 space-y-2.5 xl:flex-1 xl:px-6 xl:py-4 xl:space-y-3">
//         {subgroup.checks.map((check) => {
//           const st = STATUS_ICON[check.status] || STATUS_ICON["not-applicable"];
//           return (
//             <li
//               key={check.label}
//               className="flex items-start gap-2.5 xl:gap-3 xl:items-center"
//             >
//               <span
//                 // className={`mt-0.5 flex-shrink-0 w-5 h-5 flex items-center justify-center xl:mt-0 rounded-full ${
//                 //   check.status === "passed"
//                 //     ? "bg-green-500/15 text-green-600"
//                 //     : check.status === "failed"
//                 //       ? "bg-red-500/15 text-red-600"
//                 //       : "bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400"
//                 // }`}

//                 className={`mt-0.5 flex-shrink-0 w-5 h-5 flex items-center justify-center xl:mt-0 rounded-full ${
//                   check.status === "passed"
//                     ? "bg-green-500/15 text-green-600 dark:text-green-400"
//                     : check.status === "failed"
//                       ? "bg-red-500/15 text-red-600 dark:bg-red-50"
//                       : "bg-gray-50 dark:bg-gray-500/50 text-gray-500 dark:text-gray-100"
//                 }`}
//               >
//                 <span className="text-[16px] xl:text-[18px] leading-none">
//                   {st.mark}
//                 </span>
//               </span>
//               <div className="min-w-0">
//                 {/* <p className="text-[13px] font-medium text-gray-700 leading-snug xl:text-sm">
//                   {check.label}
//                 </p> */}
//                 <p className="text-xs text-gray-600 dark:text-gray-400 leading-snug mt-0.5 xl:text-[13px]">
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

// const SeenMoreLimit = 10;

// // ==========================================================================
// // Skills table (hard and soft skills display)
// // ==========================================================================
// const SkillsTable: React.FC<{
//   skills: { item: string; status: string }[];
// }> = ({ skills }) => {
//   const [showAll, setShowAll] = useState(false);
//   const visible = showAll ? skills : skills.slice(0, SeenMoreLimit);
//   const remaining = skills.length - SeenMoreLimit;

//   return (
//     <div>
//       <div className="overflow-x-auto -mx-1">
//         <table className="w-full min-w-[300px] text-sm border-collapse">
//           <thead>
//             <tr className="text-left text-xs tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
//               <th className="py-2 px-5 font-medium">Skill</th>
//               <th className="py-2 px-5 font-medium text-center">Resume</th>
//               <th className="py-2 px-5 font-medium text-center">
//                 Job Description
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {visible.map((s) => (
//               <tr
//                 key={s.item}
//                 className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
//               >
//                 <td className="py-4 pl-5 pr-2 text-xs text-gray-800 dark:text-gray-200 break-words">
//                   {s.item}
//                 </td>
//                 <td className="py-2.5 px-2 text-center">
//                   {s.status === "matched" ? (
//                     <span
//                       className="inline-flex text-[16px] xl:text-[18px] items-center justify-center text-green-600"
//                       title={`${s.item} found in resume`}
//                     >
//                       ✓
//                     </span>
//                   ) : (
//                     <span
//                       className="inline-flex text-[16px] xl:text-[18px] items-center justify-center text-red-600 dark:text-red-300"
//                       title={`${s.item} missing from resume`}
//                     >
//                       ✗
//                     </span>
//                   )}
//                 </td>
//                 <td className="py-2.5 pr-5 pl-2 text-center">
//                   <span
//                     className="inline-flex text-[16px] xl:text-[18px] items-center justify-center text-green-600"
//                     title="Required by the job description"
//                   >
//                     ✓
//                   </span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {skills.length > SeenMoreLimit && (
//         <button
//           onClick={() => setShowAll((v) => !v)}
//           className="mt-3 py-2 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//         >
//           {showAll ? "See Less" : `See More (${remaining} more)`}
//         </button>
//       )}
//     </div>
//   );
// };

// // ==========================================================================
// // Formatting lock
// // ==========================================================================
// const isFormattingCategory = (key: string) => key === "formatting";

// const FormattingLock: React.FC<{ onShowTips: () => void }> = ({
//   onShowTips,
// }) => {
//   return (
//     <div className="relative border border-green-500/30 bg-green-500/5 overflow-hidden">
//       {/* Blurred content placeholder */}
//       <div className="blur-[5px] select-none pointer-events-none p-4 opacity-60">
//         <div className="space-y-3">
//           <div className="bg-gray-100 dark:bg-gray-700 p-4 space-y-2.5">
//             <div className="w-24 h-4 bg-gray-300" />
//             {[0, 1, 2].map((i) => (
//               <div key={i} className="flex items-center gap-2.5">
//                 <div className="w-5 h-5 bg-gray-300 flex-shrink-0" />
//                 <div className="flex-1 h-3 bg-gray-300" />
//               </div>
//             ))}
//           </div>
//           <div className="bg-gray-100 dark:bg-gray-700 p-4 space-y-2.5">
//             <div className="w-20 h-4 bg-gray-300" />
//             {[0, 1].map((i) => (
//               <div key={i} className="flex items-center gap-2.5">
//                 <div className="w-5 h-5 bg-gray-300 flex-shrink-0" />
//                 <div className="flex-1 h-3 bg-gray-300" />
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Overlay text on top of blur */}
//       <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 py-6">
//         <p className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 leading-tight mb-1.5">
//           Unavailable for Free
//         </p>
//         <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 max-w-md">
//           This section only works with AI scans. Get free tips to make your
//           resume formatting perfect.
//         </p>
//         <button
//           onClick={onShowTips}
//           className="inline-flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-600/90 text-white text-sm font-semibold shadow-lg"
//         >
//           <EyeOff className="w-4 h-4" />
//           Show Tips
//         </button>
//       </div>
//     </div>
//   );
// };

// const ReviewCard: React.FC<{
//   category: CategoryResult;
//   index: number;
//   hasFormattingData?: boolean;
// }> = ({ category, index, hasFormattingData = false }) => {
//   const meta = CATEGORY_META[category.key] || CATEGORY_META.hardSkills;
//   const hasSkillChips =
//     (category.matched && category.matched.length > 0) ||
//     (category.missing && category.missing.length > 0);
//   const hasSubgroups = !!category.subgroups && category.subgroups.length > 0;
//   const [tipsOpen, setTipsOpen] = useState(false);

//   const content = (
//     <>
//       {/* Sub-group breakdown (e.g. Searchability) */}
//       {hasSubgroups && (
//         <div className="space-y-3 mb-4">
//           {category.subgroups!.map((subgroup) => (
//             <SubgroupBlock key={subgroup.key} subgroup={subgroup} />
//           ))}
//         </div>
//       )}

//       {/* Skills table */}
//       {hasSkillChips && (
//         <div className="mb-4">
//           <SkillsTable
//             skills={[
//               ...(category.matched?.map((item) => ({
//                 item,
//                 status: "matched",
//               })) || []),
//               ...(category.missing?.map((item) => ({
//                 item,
//                 status: "missing",
//               })) || []),
//             ]}
//           />
//         </div>
//       )}
//     </>
//   );

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: index * 0.08 }}
//       className={`${meta.accent} p-5 bg-white dark:bg-secondary rounded-lg shadow-[0_0_6px_rgba(0,0,0,0.2)]`}
//     >
//       {/* Header */}
//       <div className="flex items-start justify-between gap-3 mb-3">
//         <div className="flex items-center gap-3">
//           {/* <div
//             className={`w-10 h-10 flex items-center justify-center ${meta.iconColor}`}
//           >
//             {meta.icon}
//           </div> */}
//           <div>
//             <h3 className="font-semibold text-gray-800 dark:text-gray-100 leading-tight">
//               {category.title}
//             </h3>
//             <p className="text-xs text-gray-500 dark:text-gray-400">
//               {category.summary}
//             </p>
//           </div>
//         </div>
//         <span className={`text-xs text-gray-700 dark:text-gray-400 font-bold`}>{category.score}%</span>
//       </div>

//       {isFormattingCategory(category.key) && !hasFormattingData ? (
//         <FormattingLock onShowTips={() => setTipsOpen(true)} />
//       ) : (
//         content
//       )}

//       <FormattingTipsModal
//         isOpen={tipsOpen}
//         onClose={() => setTipsOpen(false)}
//       />
//     </motion.div>
//   );
// };

// export default ReviewCard;

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, MinusCircle, EyeOff } from "lucide-react";
import { CategoryResult, CategorySubgroup, CheckStatus } from "../../types";
import FormattingTipsModal from "./FormattingTipsModal";

const STATUS_ICON: Record<
  CheckStatus,
  { icon: React.ReactNode; color: string; mark: string }
> = {
  passed: {
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: "text-emerald-600",
    mark: "✓",
  },
  failed: {
    icon: <XCircle className="w-5 h-5" />,
    color: "text-red-600",
    mark: "✗",
  },
  "not-applicable": {
    icon: <MinusCircle className="w-5 h-5" />,
    color: "text-stone-400",
    mark: "–",
  },
};

const SubgroupBlock: React.FC<{ subgroup: CategorySubgroup }> = ({
  subgroup,
}) => {
  return (
    <div className="font-plex border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden xl:flex xl:items-stretch">
      {/* Left side - Title with border on xl screens */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-800 xl:border-b-0 xl:border-r xl:w-64 xl:flex-shrink-0 xl:px-6 xl:py-4">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 leading-tight">
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
                    ? "bg-emerald-500/10 text-emerald-600"
                    : check.status === "failed"
                      ? "bg-red-500/10 text-red-600"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-400"
                }`}
              >
                <span className="text-[16px] xl:text-[18px] leading-none">
                  {st.mark}
                </span>
              </span>
              <div className="min-w-0">
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-snug mt-0.5 xl:text-[13px]">
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
    <div className="font-plex">
      <div className="overflow-x-auto -mx-1">
        <table className="w-full min-w-[300px] text-sm border-collapse">
          <thead>
            <tr className="text-left text-xs tracking-wide text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
              <th className="py-2 px-5 font-medium">Skill</th>
              <th className="py-2 px-5 font-medium text-center">Resume</th>
              <th className="py-2 px-5 font-medium text-center">
                Job description
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((s) => (
              <tr
                key={s.item}
                className="border-b border-stone-200 dark:border-stone-800 last:border-b-0"
              >
                <td className="py-4 pl-5 pr-2 text-xs text-stone-800 dark:text-stone-200 break-words">
                  {s.item}
                </td>
                <td className="py-2.5 px-2 text-center">
                  {s.status === "matched" ? (
                    <span
                      className="inline-flex text-[16px] xl:text-[18px] items-center justify-center text-emerald-600"
                      title={`${s.item} found in resume`}
                    >
                      ✓
                    </span>
                  ) : (
                    <span
                      className="inline-flex text-[16px] xl:text-[18px] items-center justify-center text-red-500 dark:text-red-400"
                      title={`${s.item} missing from resume`}
                    >
                      ✗
                    </span>
                  )}
                </td>
                <td className="py-2.5 pr-5 pl-2 text-center">
                  <span
                    className="inline-flex text-[16px] xl:text-[18px] items-center justify-center text-emerald-600"
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
          className="mt-3 py-2 px-4 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
        >
          {showAll ? "See less" : `See more (${remaining} more)`}
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
    <div className="relative border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 rounded-lg overflow-hidden">
      {/* Blurred content placeholder */}
      <div className="blur-[5px] select-none pointer-events-none p-4 opacity-60">
        <div className="space-y-3">
          <div className="bg-stone-200 dark:bg-stone-700 rounded-lg p-4 space-y-2.5">
            <div className="w-24 h-4 bg-stone-300 dark:bg-stone-600 rounded" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-5 h-5 bg-stone-300 dark:bg-stone-600 rounded-full flex-shrink-0" />
                <div className="flex-1 h-3 bg-stone-300 dark:bg-stone-600 rounded" />
              </div>
            ))}
          </div>
          <div className="bg-stone-200 dark:bg-stone-700 rounded-lg p-4 space-y-2.5">
            <div className="w-20 h-4 bg-stone-300 dark:bg-stone-600 rounded" />
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-5 h-5 bg-stone-300 dark:bg-stone-600 rounded-full flex-shrink-0" />
                <div className="flex-1 h-3 bg-stone-300 dark:bg-stone-600 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overlay text on top of blur */}
      <div className="font-plex absolute inset-0 flex flex-col items-center justify-center text-center px-4 py-6">
        <p className="font-fraunces text-lg md:text-xl text-stone-900 dark:text-stone-50 leading-tight mb-1.5">
          Unavailable for free
        </p>
        <p className="text-sm text-stone-600 dark:text-stone-300 mb-4 max-w-md">
          This section only works with AI scans. Get free tips to make your
          resume formatting perfect.
        </p>
        <button
          onClick={onShowTips}
          className="inline-flex items-center gap-2 px-5 py-2 bg-stone-900 dark:bg-lime-300 hover:bg-stone-800 dark:hover:bg-lime-200 text-stone-50 dark:text-stone-900 text-sm font-semibold rounded-lg transition-colors"
        >
          <EyeOff className="w-4 h-4" />
          Show tips
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
  const hasSkillChips =
    (category.matched && category.matched.length > 0) ||
    (category.missing && category.missing.length > 0);
  const hasSubgroups = !!category.subgroups && category.subgroups.length > 0;
  const [tipsOpen, setTipsOpen] = useState(false);
  const isLowScore = category.score < 50;

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
      className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-plex font-semibold text-stone-800 dark:text-stone-100 leading-tight">
            {category.title}
          </h3>
          <p className="font-plex text-xs text-stone-500 dark:text-stone-400">
            {category.summary}
          </p>
        </div>
        <span
          className={`font-plex text-xs font-bold ${
            isLowScore
              ? "text-red-500 dark:text-red-400"
              : "text-stone-700 dark:text-stone-300"
          }`}
        >
          {category.score}%
        </span>
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
    </motion.div>
  );
};

export default ReviewCard;
