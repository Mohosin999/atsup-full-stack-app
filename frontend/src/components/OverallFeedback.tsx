/* ===================================
Overall Feedback Component
=================================== */
import { TrendingUp } from "lucide-react";
import { Analysis } from "../types";

export default function OverallFeedback({ analysis }: { analysis: Analysis }) {
  return (
    <div className="card p-6">
      <div className="flex items-start gap-3">
        <TrendingUp className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Analysis Summary</h3>
          <p className="text-gray-600 dark:text-gray-600 leading-relaxed">
            {analysis.feedback?.overall || "Analysis complete. Review the detailed breakdown below for actionable insights."}
          </p>
        </div>
      </div>
    </div>
  );
}
