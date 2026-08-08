/* ===================================
Resume Achievements Component
=================================== */
import { Achievement } from "../../types";

interface ResumeAchievementsProps {
  achievements: Achievement[];
  forPdf?: boolean;
}

export default function ResumeAchievements({ achievements, forPdf }: ResumeAchievementsProps) {
  const textColor = forPdf ? "text-gray-900" : "text-gray-900 dark:text-gray-800";
  const titleColor = forPdf ? "text-black" : "text-gray-900 dark:text-white";
  const borderColor = forPdf ? "border-gray-200" : "border-gray-200 dark:border-gray-300";

  return (
    <div className="mb-4">
      <h2 className={`text-base font-bold ${titleColor} uppercase tracking-wide border-b ${borderColor} pb-1 mb-3`}>
        ACHIEVEMENTS
      </h2>
      <div className="space-y-1">
        {achievements.map((ach, index) => (
          <div key={index} className={`${textColor} text-sm`}>• {ach.title}</div>
        ))}
      </div>
    </div>
  );
}
