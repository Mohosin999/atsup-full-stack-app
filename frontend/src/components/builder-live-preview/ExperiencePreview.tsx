import { ResumeContent } from "@/types";

export function ExperiencePreview({
  experience,
  formatDescription,
}: {
  experience: ResumeContent["experience"];
  forPdf: boolean;
  formatDescription: (highlights: string[]) => React.ReactNode;
}) {
  return (
    <div className="mb-2 lg:mb-3 px-2 lg:px-6">
      <h2 className="text-[9px] lg:text-[10px] font-bold text-black uppercase tracking-wide border-b border-gray-700 mb-1">
        EXPERIENCE
      </h2>
      {experience.map((exp, index) => (
        <div key={index} className="mb-2 lg:mb-2.5 last:mb-0">
          <div className="flex justify-between items-start gap-1">
            <div className="min-w-0 flex-1">
              <h3 className="text-[9px] lg:text-[10px] font-bold text-black truncate">
                {exp.company}
              </h3>
              <p className="text-[8px] lg:text-[9px] text-black font-medium truncate">
                {exp.title}
                {exp.topSkills && exp.topSkills.length > 0 && (
                  <span className="font-normal text-black">
                    {" - "}
                    {exp.topSkills.map((skill, i) => (
                      <span key={i} className="italic">
                        {skill}
                        {i < exp.topSkills!.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </span>
                )}
              </p>
            </div>
            <div className="text-right min-w-0">
              <p className="text-[8px] lg:text-[9px] text-black">
                {exp.startDate} - {exp.current ? "Present" : exp.endDate || ""}
              </p>
              {exp.location && (
                <p className="text-[8px] lg:text-[9px] text-black">{exp.location}</p>
              )}
            </div>
          </div>
          {exp.highlights && exp.highlights.length > 0 && (
            <div className="mt-0.5">{formatDescription(exp.highlights)}</div>
          )}
        </div>
      ))}
    </div>
  );
}
