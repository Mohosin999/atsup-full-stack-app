// import React from "react";
// import { motion } from "framer-motion";
// import ScoreCircle from "./ScoreCircle";
// import { CategoriesResult } from "../../types";

// interface CategoryChecklistProps {
//   overallScore: number;
//   categories: CategoriesResult;
// }

// const CATEGORY_META: Record<string, { bar: string; glow: string }> = {
//   searchability: {
//     bar: "bg-sky-500",
//     glow: "text-sky-400",
//   },
//   hardSkills: {
//     bar: "bg-sky-500",
//     glow: "text-sky-400",
//   },
//   softSkills: {
//     bar: "bg-sky-500",
//     glow: "text-sky-400",
//   },
//   recruiterTips: {
//     bar: "bg-sky-500",
//     glow: "text-sky-400",
//   },
//   formatting: {
//     bar: "bg-sky-500",
//     glow: "text-sky-400",
//   },
// };

// const CategoryRow: React.FC<{
//   category: CategoriesResult[keyof CategoriesResult];
// }> = ({ category }) => {
//   const meta = CATEGORY_META[category.key] || CATEGORY_META.hardSkills;
//   const activeChecks = category.checks.filter((c) => c.status !== "na");
//   const passedCount = activeChecks.filter((c) => c.status === "passed").length;
//   const hasMatchData =
//     !!(category.matched && category.missing) &&
//     (category.matched!.length > 0 || category.missing!.length > 0);
//   const matchedCount = hasMatchData ? category.matched!.length : passedCount;
//   const totalItems = hasMatchData
//     ? (category.matched?.length ?? 0) + (category.missing?.length ?? 0)
//     : activeChecks.length;

//   return (
//     <div className="rounded-xl overflow-hidden">
//       <div className="w-full flex items-center gap-3 px-3.5 py-1 text-left hover:bg-white/90 transition-colors">
//         <div className="flex-1 min-w-0">
//           <div className="flex items-center justify-between gap-2">
//             <span className="text-xs text-gray-800 truncate">
//               {category.title}
//             </span>
//             <span className="text-xs text-gray-800 truncate">
//               {totalItems - matchedCount} issues to fix
//             </span>
//           </div>
//           <div className="mt-1.5 flex items-center gap-2">
//             <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
//               <motion.div
//                 className={`h-full ${category.score < 50 ? "bg-red-500" : "bg-sky-500"}`}
//                 initial={{ width: 0 }}
//                 animate={{ width: `${category.score}%` }}
//                 transition={{ duration: 0.8, ease: "easeOut" }}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const CategoryChecklist: React.FC<CategoryChecklistProps> = ({
//   overallScore,
//   categories,
// }) => {
//   const order: (keyof CategoriesResult)[] = [
//     "searchability",
//     "hardSkills",
//     "softSkills",
//     "recruiterTips",
//     "formatting",
//   ];

//   return (
//     <div className="bg-white/80 px-5 py-7 rounded-xl box-shadow">
//       <div className="flex justify-center pb-4">
//         <ScoreCircle score={overallScore} label="Match Rate" size="md" />
//       </div>

//       <div className="space-y-2">
//         {order.map((key) => (
//           <CategoryRow key={key} category={categories[key]} />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default CategoryChecklist;

import React from "react";
import { motion } from "framer-motion";
import ScoreCircle from "./ScoreCircle";
import { CategoriesResult } from "../../types";

interface CategoryChecklistProps {
  overallScore: number;
  categories: CategoriesResult;
}

const CATEGORY_META: Record<string, { bar: string; glow: string }> = {
  searchability: {
    bar: "bg-sky-500",
    glow: "text-sky-400",
  },
  hardSkills: {
    bar: "bg-sky-500",
    glow: "text-sky-400",
  },
  softSkills: {
    bar: "bg-sky-500",
    glow: "text-sky-400",
  },
  recruiterTips: {
    bar: "bg-sky-500",
    glow: "text-sky-400",
  },
  formatting: {
    bar: "bg-sky-500",
    glow: "text-sky-400",
  },
};

const CategoryRow: React.FC<{
  category: CategoriesResult[keyof CategoriesResult];
}> = ({ category }) => {
  const meta = CATEGORY_META[category.key] || CATEGORY_META.hardSkills;
  const activeChecks = category.checks.filter((c) => c.status !== "na");
  const passedCount = activeChecks.filter((c) => c.status === "passed").length;
  const hasMatchData =
    !!(category.matched && category.missing) &&
    (category.matched!.length > 0 || category.missing!.length > 0);
  const matchedCount = hasMatchData ? category.matched!.length : passedCount;
  const totalItems = hasMatchData
    ? (category.matched?.length ?? 0) + (category.missing?.length ?? 0)
    : activeChecks.length;

  return (
    <div className="rounded-xl overflow-hidden">
      <div className="w-full flex items-center gap-3 px-3.5 py-1 text-left hover:bg-white/90 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-gray-800 truncate">
              {category.title}
            </span>
            <span className="text-xs text-gray-800 truncate">
              {totalItems - matchedCount} issues to fix
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${category.score < 50 ? "bg-red-500" : "bg-sky-500"}`}
                initial={{ width: 0 }}
                animate={{ width: `${category.score}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CategoryChecklist: React.FC<CategoryChecklistProps> = ({
  overallScore,
  categories,
}) => {
  const order: (keyof CategoriesResult)[] = [
    "searchability",
    "hardSkills",
    "softSkills",
    "recruiterTips",
    "formatting",
  ];

  return (
    <div className="bg-white/80 px-5 py-7 rounded-xl box-shadow">
      <div className="flex justify-center pb-4">
        <ScoreCircle score={overallScore} label="Match Rate" size="md" />
      </div>

      <div className="space-y-2">
        {order.map((key) => (
          <CategoryRow key={key} category={categories[key]} />
        ))}
      </div>
    </div>
  );
};

export default CategoryChecklist;
