/* ===================================
Resume Projects Component
=================================== */
import { Project } from "../../types";

interface ResumeProjectsProps {
  projects: Project[];
  forPdf?: boolean;
  formatDescription: (highlights: string[]) => React.ReactNode;
}

export default function ResumeProjects({ projects, forPdf, formatDescription }: ResumeProjectsProps) {
  const textColor = forPdf ? "text-gray-900" : "text-gray-900 dark:text-gray-100";
  const titleColor = forPdf ? "text-black" : "text-gray-900 dark:text-white";
  const borderColor = forPdf ? "border-gray-700" : "border-gray-700 dark:border-gray-600";

  return (
    <div className="mb-4">
      <h2 className={`text-base font-bold ${titleColor} uppercase tracking-wide border-b ${borderColor} pb-1 mb-3`}>
        PROJECTS
      </h2>
      {projects.map((proj, index) => (
        <div key={index} className="mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-bold ${titleColor} text-base`}>{proj.name}</span>
            <div className="flex items-center gap-2">
              {proj.links?.live && (
                <a
                  href={proj.links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-emerald-600 hover:text-emerald-500 underline"
                >
                  Live
                </a>
              )}
              {proj.links?.github && (
                <a
                  href={proj.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-emerald-600 hover:text-emerald-500 underline"
                >
                  GitHub
                </a>
              )}
            </div>
          </div>
          {proj.technologies && proj.technologies.length > 0 && (
            <p className={`text-sm ${textColor} mt-1 italic`}>{proj.technologies.join(", ")}</p>
          )}
          <div className={`${forPdf ? "text-gray-900" : "text-gray-900 dark:text-gray-100"} text-sm mt-1`}>
            {formatDescription(proj.highlights)}
          </div>
        </div>
      ))}
    </div>
  );
}
