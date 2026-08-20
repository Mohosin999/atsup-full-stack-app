/* ===================================
Resume Education Component
=================================== */
import { Education } from "../../types";

interface ResumeEducationProps {
  education: Education[];
  forPdf?: boolean;
}

export default function ResumeEducation({ education, forPdf }: ResumeEducationProps) {
  const textColor = forPdf ? "text-gray-800" : "text-gray-800 dark:text-gray-800";
  const titleColor = forPdf ? "text-black" : "text-gray-800 dark:text-white";
  const borderColor = forPdf ? "border-gray-200" : "border-gray-200 dark:border-gray-300";

  return (
    <div className="mb-4">
      <h2 className={`text-base font-bold ${titleColor} uppercase tracking-wide border-b ${borderColor} pb-1 mb-3`}>
        EDUCATION
      </h2>
      {education.map((edu, index) => (
        <div key={index} className="mb-2">
          <div className="flex justify-between items-start gap-2">
            <span className={`font-bold ${titleColor} text-base`}>
              {edu.institution}
            </span>
            <span className={`text-sm ${textColor} flex-shrink-0`}>
              {[edu.startDate, edu.endDate].filter(Boolean).join(" - ")}
            </span>
          </div>
          <p className={`${textColor} text-sm mt-0.5`}>{edu.degree}</p>
        </div>
      ))}
    </div>
  );
}
