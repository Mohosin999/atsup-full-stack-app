/* ===================================
Resume Achievements Component
=================================== */
import { Achievement } from "../../types";

interface ResumeAchievementsProps {
  achievements: Achievement[];
  forPdf?: boolean;
}

export default function ResumeAchievements({ achievements, forPdf }: ResumeAchievementsProps) {
  const textColor = forPdf ? "text-gray-800" : "text-gray-800";
  const titleColor = forPdf ? "text-black" : "text-gray-800";
  const borderColor = forPdf ? "border-gray-200" : "border-gray-200";

  return (
    <div className="mb-4">
      <h2 className={`text-base font-bold ${titleColor} uppercase tracking-wide border-b ${borderColor} pb-1 mb-3`}>
        ACHIEVEMENTS
      </h2>
      <div className="space-y-1">
        {achievements.map((ach, index) => (
          <div key={index} className="mb-2">
            <div className="flex justify-between items-start gap-2">
              <span className={`${titleColor} text-base font-bold`}>
                {ach.title}
              </span>
              <span className={`text-sm ${textColor} flex-shrink-0`}>
                {ach.date}
              </span>
            </div>
            {ach.description && (
              <p className={`${textColor} text-sm mt-0.5`}>{ach.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}