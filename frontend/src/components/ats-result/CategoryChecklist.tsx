import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  MinusCircle,
  ChevronDown,
  Search,
  Wrench,
  Users,
  UserCheck,
  LayoutTemplate,
} from "lucide-react";
import ScoreCircle from "./ScoreCircle";
import { CategoriesResult, CheckStatus } from "../../types";

interface CategoryChecklistProps {
  overallScore: number;
  categories: CategoriesResult;
}

const CATEGORY_META: Record<
  string,
  { icon: React.ReactNode; bar: string; glow: string }
> = {
  searchability: {
    icon: <Search className="w-4 h-4" />,
    bar: "bg-sky-500",
    glow: "text-sky-400",
  },
  hardSkills: {
    icon: <Wrench className="w-4 h-4" />,
    bar: "bg-green-500",
    glow: "text-green-400",
  },
  softSkills: {
    icon: <Users className="w-4 h-4" />,
    bar: "bg-purple-500",
    glow: "text-purple-400",
  },
  recruiterTips: {
    icon: <UserCheck className="w-4 h-4" />,
    bar: "bg-orange-500",
    glow: "text-orange-400",
  },
  formatting: {
    icon: <LayoutTemplate className="w-4 h-4" />,
    bar: "bg-pink-500",
    glow: "text-pink-400",
  },
};

const STATUS_ICON: Record<CheckStatus, { icon: React.ReactNode; color: string }> = {
  passed: { icon: <CheckCircle2 className="w-4 h-4" />, color: "text-green-400" },
  partial: { icon: <AlertCircle className="w-4 h-4" />, color: "text-amber-400" },
  failed: { icon: <XCircle className="w-4 h-4" />, color: "text-red-400" },
  na: { icon: <MinusCircle className="w-4 h-4" />, color: "text-gray-500" },
};

const SubgroupList: React.FC<{
  subgroup: { key: string; title: string; score: number; checks: Array<{ label: string; status: CheckStatus; detail: string; weight: number }> };
}> = ({ subgroup }) => (
  <div className="rounded-lg border border-gray-700/40 bg-gray-900/30 overflow-hidden">
    <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-gray-700/20 border-b border-gray-700/40">
      <span className="text-xs font-semibold text-gray-200 truncate">
        {subgroup.title}
      </span>
      <span className="flex-shrink-0 text-xs font-bold text-gray-300">
        {subgroup.score}%
      </span>
    </div>
    <ul className="px-3 py-1.5 space-y-1.5">
      {subgroup.checks.map((check) => {
        const st = STATUS_ICON[check.status];
        return (
          <li key={check.label} className="flex items-start gap-1.5">
            <span className={`mt-0.5 flex-shrink-0 ${st.color}`}>{st.icon}</span>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-gray-200">
                {check.label}
              </p>
              <p className="text-[10px] text-gray-500 leading-snug">
                {check.detail}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  </div>
);

const CategoryRow: React.FC<{
  category: CategoriesResult[keyof CategoriesResult];
}> = ({ category }) => {
  const [open, setOpen] = useState(false);
  const meta = CATEGORY_META[category.key] || CATEGORY_META.hardSkills;
  const activeChecks = category.checks.filter((c) => c.status !== "na");
  const passedCount = activeChecks.filter((c) => c.status === "passed").length;

  return (
    <div className="rounded-xl border border-gray-700/60 bg-gray-800/40 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-gray-800/80 transition-colors"
      >
        <span className={`flex-shrink-0 ${meta.glow}`}>{meta.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-white truncate">
              {category.title}
            </span>
            <span className="flex-shrink-0 text-sm font-bold text-white">
              {category.score}%
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${meta.bar}`}
                initial={{ width: 0 }}
                animate={{ width: `${category.score}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <span className="text-[10px] text-gray-500 flex-shrink-0">
              {passedCount}/{activeChecks.length} ok · {category.weight}%
            </span>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-700/60"
          >
            {category.subgroups && category.subgroups.length > 0 ? (
              <div className="px-3.5 py-2 space-y-2">
                {category.subgroups.map((subgroup) => (
                  <SubgroupList key={subgroup.key} subgroup={subgroup} />
                ))}
              </div>
            ) : (
              <ul className="px-3.5 py-2 space-y-2">
                {category.checks.map((check) => {
                  const st = STATUS_ICON[check.status];
                  return (
                    <li key={check.label} className="flex items-start gap-2">
                      <span className={`mt-0.5 flex-shrink-0 ${st.color}`}>
                        {st.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-200">
                          {check.label}
                        </p>
                        <p className="text-[11px] text-gray-500 leading-snug">
                          {check.detail}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
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
    <div className="bg-gray-800/60 rounded-2xl border border-gray-700/60 p-5 backdrop-blur-sm">
      <div className="flex justify-center pt-2 pb-4">
        <ScoreCircle
          score={overallScore}
          label="Overall ATS Score"
          sublabel="5-category weighted average"
          size="lg"
        />
      </div>

      <div className="mb-4 px-1">
        <h3 className="text-sm font-semibold text-gray-300 mb-1">
          What we checked
        </h3>
        <p className="text-xs text-gray-500">
          Tap a category to see every individual check.
        </p>
      </div>

      <div className="space-y-2">
        {order.map((key) => (
          <CategoryRow key={key} category={categories[key]} />
        ))}
      </div>

      <p className="mt-4 text-[11px] text-gray-600 leading-relaxed">
        Overall score = weighted average: Searchability 30%, Hard Skills 35%,
        Soft Skills 15%, Recruiter Tips 10%, Formatting 10%.
      </p>
    </div>
  );
};

export default CategoryChecklist;
