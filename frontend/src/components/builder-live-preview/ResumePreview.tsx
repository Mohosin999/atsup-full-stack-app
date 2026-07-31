import { ResumeContent } from "@/types";
import { PersonalInfoPreview } from "./PersonalInfoPreview";
import { SummaryPreview } from "./SummaryPreview";
import { ExperiencePreview } from "./ExperiencePreview";
import { ProjectsPreview } from "./ProjectsPreview";
import { AchievementsPreview } from "./AchievementsPreview";
import { EducationPreview } from "./EducationPreview";
import { SkillsPreview } from "./SkillsPreview";
import { FileText } from "lucide-react";

interface ResumePreviewProps {
  content: ResumeContent;
  forPdf?: boolean;
}

export function ResumePreview({ content, forPdf = false }: ResumePreviewProps) {
  const formatDescription = (highlights: string[]): React.ReactNode => {
    const lines = (highlights || []).filter((line) => line.trim());
    if (lines.length === 0) return null;
    return (
      <ul className="list-outside list-disc pl-4 lg:pl-6 space-y-0 lg:space-y-0.5 text-[8px] lg:text-[10px] marker:font-normal text-black">
        {lines.map((line, i) => {
          const cleanLine = line.replace(/^[•\-\*]\s*/, "").trim();
          if (!cleanLine) return null;
          return (
            <li key={i} className="pl-1 text-black">
              {cleanLine}
            </li>
          );
        })}
      </ul>
    );
  };

  const hasAnyContent =
    content.personalInfo?.fullName ||
    content.personalInfo?.jobTitle ||
    content.personalInfo?.contact?.email ||
    content.summary ||
    content.experience?.length > 0 ||
    (content.projects && content.projects.length > 0) ||
    (content.achievements && content.achievements.length > 0) ||
    content.education?.length > 0 ||
    (content.skills?.length || 0) > 0;

  return (
    <div className="text-gray-950 font-sans w-full">
      {/* Personal Info */}
      <PersonalInfoPreview content={content} forPdf={forPdf} />

      {/* Summary */}
      {content.summary && <SummaryPreview content={content} forPdf={forPdf} />}

      {/* Experience */}
      {content.experience.length > 0 && (
        <ExperiencePreview
          experience={content.experience}
          forPdf={forPdf}
          formatDescription={formatDescription}
        />
      )}

      {/* Projects */}
      {content.projects && content.projects.length > 0 && (
        <ProjectsPreview
          projects={content.projects}
          forPdf={forPdf}
          formatDescription={formatDescription}
        />
      )}

      {/* Achievements */}
      {content.achievements && content.achievements.length > 0 && (
        <AchievementsPreview
          achievements={content.achievements}
          forPdf={forPdf}
        />
      )}

      {/* Education */}
      {content.education.length > 0 && (
        <EducationPreview education={content.education} forPdf={forPdf} />
      )}

      {/* Skills */}
      {(content.skills?.length || 0) > 0 && (
        <SkillsPreview content={content} forPdf={forPdf} />
      )}

      {/* Empty State */}
      {!hasAnyContent && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <FileText className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-sm">
            Start filling out the form to see your resume preview
          </p>
        </div>
      )}
    </div>
  );
}
