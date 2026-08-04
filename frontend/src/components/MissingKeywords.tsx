/* ===================================
Missing Keywords Component
=================================== */
import { AlertCircle } from "lucide-react";
import { SkillList } from "./ui/SkillBadge";

export default function MissingKeywords({ keywords }: { keywords: string[] }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Missing Keywords ({keywords.length})</h3>
      </div>
      <SkillList skills={keywords} type="missing" maxDisplay={20} />
      <p className="text-xs text-gray-500 dark:text-gray-600 mt-4">
        Tip: Incorporate these keywords naturally throughout your resume, especially in the skills and experience sections.
      </p>
    </div>
  );
}
