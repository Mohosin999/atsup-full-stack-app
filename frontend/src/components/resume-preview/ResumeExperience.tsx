/* ===================================
Resume Experience Component
=================================== */
import { Experience } from "../../types";

interface ResumeExperienceProps {
  experience: Experience[];
  forPdf?: boolean;
  formatDescription: (highlights: string[]) => React.ReactNode;
}

export default function ResumeExperience({
  experience,
  forPdf,
  formatDescription,
}: ResumeExperienceProps) {
  const textColor = forPdf
    ? "text-gray-900"
    : "text-gray-900 dark:text-gray-800";
  const titleColor = forPdf ? "text-black" : "text-gray-900 dark:text-white";
  const borderColor = forPdf
    ? "border-gray-200"
    : "border-gray-200 dark:border-gray-300";

  return (
    <div className="mb-4">
      <h2
        className={`text-base font-bold ${titleColor} uppercase tracking-wide border-b ${borderColor} pb-1 mb-3`}
      >
        EXPERIENCE
      </h2>
      {experience.map((exp, index) => (
        <div key={index} className="mb-3">
          <div className="flex justify-between items-start gap-2">
            <span className={`font-bold ${titleColor} text-base`}>
              {exp.title}
            </span>
            <span className={`text-sm ${textColor} flex-shrink-0`}>
              {exp.startDate} - {exp.current ? "Present" : exp.endDate}
            </span>
          </div>
          <p className={`${textColor} text-sm font-medium mt-0.5`}>
            {exp.company}
          </p>
          <div
            className={`${forPdf ? "text-gray-900" : "text-gray-900 dark:text-gray-800"} text-sm mt-1`}
          >
            {formatDescription(exp.highlights)}
          </div>
        </div>
      ))}
    </div>
  );
}
