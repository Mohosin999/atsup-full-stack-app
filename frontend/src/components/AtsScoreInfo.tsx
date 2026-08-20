/* ===================================
ATS Score Info Component
=================================== */
import { Target, BookOpen } from "lucide-react";

const scoreBreakdown = [
  { label: "Keyword Matching (30%)", color: "bg-blue-500" },
  { label: "Skills Match (30%)", color: "bg-purple-500" },
  { label: "Section Completeness (30%)", color: "bg-cyan-500" },
  { label: "Experience Relevance (10%)", color: "bg-orange-500" },
];

export default function AtsScoreInfo() {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ATS Score Breakdown</h3>
      </div>
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">How ATS Score is Calculated</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-700 dark:text-blue-300">
              {scoreBreakdown.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
