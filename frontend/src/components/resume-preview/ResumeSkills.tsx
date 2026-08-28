/* ===================================
Resume Skills Component
=================================== */
import { ResumeContent } from "../../types";

interface ResumeSkillsProps {
  content: ResumeContent;
  forPdf?: boolean;
}

export default function ResumeSkills({ content, forPdf }: ResumeSkillsProps) {
  const textColor = forPdf ? "text-gray-800" : "text-gray-800";
  const titleColor = forPdf ? "text-black" : "text-gray-800";
  const borderColor = forPdf ? "border-gray-200" : "border-gray-200";

  const skills = content.skills || [];

  return (
    <div className="mb-4">
      <h2 className={`text-base font-bold ${titleColor} uppercase tracking-wide border-b ${borderColor} pb-1 mb-3`}>
        SKILLS
      </h2>
      <div className={`${textColor} text-sm space-y-1`}>
        {skills.length > 0 && (
          <div>{skills.join(", ")}</div>
        )}
      </div>
    </div>
  );
}
