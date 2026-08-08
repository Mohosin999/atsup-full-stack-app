/* ===================================
Skills Analysis Component
=================================== */
import { Zap, CheckCircle, AlertCircle } from "lucide-react";
import { Analysis } from "../types";
import { SkillList } from "./ui/SkillBadge";

export default function SkillsAnalysis({ analysis }: { analysis: Analysis }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Skills Analysis</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-700">Matched Skills ({analysis.sectionScores?.skills?.matched?.length || 0})</span>
          </div>
          <SkillList skills={analysis.sectionScores?.skills?.matched || []} type="matched" maxDisplay={12} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-700">Missing Skills ({analysis.sectionScores?.skills?.missing?.length || 0})</span>
          </div>
          <SkillList skills={analysis.sectionScores?.skills?.missing || []} type="missing" maxDisplay={12} />
        </div>
      </div>
    </div>
  );
}
