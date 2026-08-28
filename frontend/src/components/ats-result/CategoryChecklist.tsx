import React, { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import ScoreCircle from "./ScoreCircle";
import FormattingTipsModal from "./FormattingTipsModal";
import { CategoriesResult } from "../../types";

interface CategoryChecklistProps {
  overallScore: number;
  categories: CategoriesResult;
  hasFormattingData?: boolean;
  onRescan?: () => void;
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
  isFormatting?: boolean;
  hasFormattingData?: boolean;
  onShowTips?: () => void;
}> = ({ category, isFormatting, hasFormattingData, onShowTips }) => {
  const activeChecks = category.checks.filter(
    (c) => c.status !== "not-applicable",
  );
  const passedCount = activeChecks.filter((c) => c.status === "passed").length;
  const hasMatchData =
    !!(category.matched && category.missing) &&
    (category.matched!.length > 0 || category.missing!.length > 0);
  const matchedCount = hasMatchData ? category.matched!.length : passedCount;
  const totalItems = hasMatchData
    ? (category.matched?.length ?? 0) + (category.missing?.length ?? 0)
    : activeChecks.length;

  if (isFormatting && !hasFormattingData) {
    return (
      <div className="overflow-hidden relative">
        <div className="w-full flex items-center gap-3 px-3.5 py-1 text-left">
          <div className="flex-1 min-w-0 blur-[0.1px] select-none pointer-events-none opacity-40">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-gray-800 dark:text-gray-100 truncate">
                {category.title}
              </span>
              <span className="text-xs text-gray-800 dark:text-gray-100 truncate">
                {totalItems - matchedCount} issues to fix
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 overflow-hidden rounded-full">
                <motion.div
                  className="h-full bg-sky-500"
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
  }

  return (
    <div className="overflow-hidden">
        <div className="w-full flex items-center gap-3 px-3.5 py-1 text-left hover:bg-white/90 dark:hover:bg-gray-800/90 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-gray-800 truncate">
              {category.title}
            </span>
            <span className="text-xs text-sky-600 truncate">
              {totalItems - matchedCount} issues to fix
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-4 bg-gray-200 overflow-hidden rounded-full">
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
  hasFormattingData = false,
  onRescan,
}) => {
  const [tipsOpen, setTipsOpen] = useState(false);
  const order: (keyof CategoriesResult)[] = [
    "searchability",
    "hardSkills",
    "softSkills",
    "recruiterTips",
    "formatting",
  ];

  return (
    <div className="px-5 py-7 bg-white dark:bg-gray-800 shadow-[0_0_6px_rgba(0,0,0,0.2)] rounded-lg">
      <div className="flex justify-center">
        <ScoreCircle score={overallScore} size="md" />
      </div>

      {onRescan && (
        <div className="flex pt-6 pb-8 w-full px-3.5">
          <button
            onClick={onRescan}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-600/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Upload & Rescan
          </button>
        </div>
      )}

      <div className="space-y-2">
        {order.map((key) => (
          <CategoryRow
            key={key}
            category={categories[key]}
            isFormatting={key === "formatting"}
            hasFormattingData={hasFormattingData}
            onShowTips={() => setTipsOpen(true)}
          />
        ))}
      </div>

      <FormattingTipsModal
        isOpen={tipsOpen}
        onClose={() => setTipsOpen(false)}
      />
    </div>
  );
};

export default CategoryChecklist;
