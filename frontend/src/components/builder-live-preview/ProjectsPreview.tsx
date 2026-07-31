import { ResumeContent } from "@/types";

export function ProjectsPreview({
  projects,
  formatDescription,
}: {
  projects: ResumeContent["projects"];
  forPdf: boolean;
  formatDescription: (highlights: string[]) => React.ReactNode;
}) {
  if (!projects || projects.length === 0) return null;

  return (
    <div className="mb-2 lg:mb-3 px-2 lg:px-6">
      <h2 className="text-[9px] lg:text-[10px] font-bold text-black uppercase tracking-wide border-b border-gray-700 mb-1">
        PROJECTS
      </h2>
      {projects.map((project, index) => (
        <div key={index} className="mb-2 last:mb-0">
          <div className="flex justify-between items-start gap-1">
            <h3 className="text-[9px] lg:text-[10px] font-bold text-black truncate">
              {project.name || "Untitled Project"}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              {project.links?.live && (
                <a
                  href={project.links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[8px] lg:text-[9px] text-blue-600"
                >
                  Live
                </a>
              )}
              {project.links?.github && (
                <a
                  href={project.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[8px] lg:text-[9px] text-blue-600"
                >
                  GitHub
                </a>
              )}
            </div>
          </div>
          {project.highlights && project.highlights.length > 0 && (
            <div className="mt-0.5">
              {formatDescription(project.highlights)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
