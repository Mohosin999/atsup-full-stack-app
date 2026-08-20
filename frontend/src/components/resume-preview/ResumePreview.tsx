import { ResumeContent } from "../../types";
import ResumePersonalInfo from "./ResumePersonalInfo";
import ResumeSummary from "./ResumeSummary";
import ResumeExperience from "./ResumeExperience";
import ResumeProjects from "./ResumeProjects";
import ResumeAchievements from "./ResumeAchievements";
import ResumeEducation from "./ResumeEducation";
import ResumeSkills from "./ResumeSkills";

interface ResumePreviewProps {
  content: ResumeContent;
  forPdf?: boolean;
}

const formatDescription = (
  highlights: string[],
  forPdf?: boolean,
): React.ReactNode => {
  const lines = (highlights || []).filter((line) => line.trim());
  if (lines.length === 0) return null;
  return (
    <ul
      className={`list-outside list-disc pl-4 space-y-0.5 text-sm ${forPdf ? "text-gray-800" : "text-gray-800 dark:text-gray-800"}`}
    >
      {lines.map((line, i) => {
        const cleanLine = line.replace(/^[•\-\*]\s*/, "").trim();
        if (!cleanLine) return null;
        return <li key={i}>{cleanLine}</li>;
      })}
    </ul>
  );
};

export default function ResumePreview({
  content,
  forPdf = false,
}: ResumePreviewProps) {
  const bgColor = forPdf ? "bg-white" : "bg-white dark:bg-white";
  const textColor = forPdf
    ? "text-gray-800"
    : "text-gray-800 dark:text-gray-800 text-sm font-sans";

  return (
    <div
      className={`${bgColor} rounded-lg shadow-lg p-6 min-h-[800px] ${textColor}`}
    >
      <ResumePersonalInfo content={content} forPdf={forPdf} />
      <ResumeSummary content={content} forPdf={forPdf} />
      {content.experience.length > 0 && (
        <ResumeExperience
          experience={content.experience}
          forPdf={forPdf}
          formatDescription={(highlights) => formatDescription(highlights, forPdf)}
        />
      )}
      {content.projects && content.projects.length > 0 && (
        <ResumeProjects
          projects={content.projects}
          forPdf={forPdf}
          formatDescription={(highlights) => formatDescription(highlights, forPdf)}
        />
      )}
      {content.achievements && content.achievements.length > 0 && (
        <ResumeAchievements
          achievements={content.achievements}
          forPdf={forPdf}
        />
      )}
      {content.education.length > 0 && (
        <ResumeEducation education={content.education} forPdf={forPdf} />
      )}
      {(content.skills?.length || 0) > 0 && (
        <ResumeSkills content={content} forPdf={forPdf} />
      )}
    </div>
  );
}
