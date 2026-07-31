import { useState } from "react";
import { Sparkles, Loader2, Trash2, Plus } from "lucide-react";
import { toast } from "react-toastify";
import { resumeBuilderApi } from "../../api/api";
import { AISectionSuggestion, Experience } from "../../types";

interface ExperienceEditorProps {
  experience: Experience[];
  onAdd: () => void;
  onUpdate: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
}

export default function ExperienceEditorAI({
  experience,
  onAdd,
  onUpdate,
  onRemove,
}: ExperienceEditorProps) {
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);

  const toHighlights = (content: string): string[] =>
    content
      .split("\n")
      .map((line) => line.replace(/^[•\-\*]\s*/, "").trim())
      .filter(Boolean);

  const handleAIGenerate = async (index: number) => {
    const exp = experience[index];

    if (!exp.title?.trim()) {
      toast.error("Please provide a Job Title first to generate highlights.");
      return;
    }

    try {
      setGeneratingIndex(index);
      const response = await resumeBuilderApi.generateSection({
        section: "Work Experience",
        context: {
          jobTitle: exp.title,
          industry: exp.company,
        },
      });

      const suggestion = response.data.data as AISectionSuggestion;
      onUpdate(index, "highlights", toHighlights(suggestion.content));
      toast.success("Experience highlights generated!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to generate highlights",
      );
    } finally {
      setGeneratingIndex(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">
          Work Experience
        </label>
        <button
          type="button"
          onClick={onAdd}
          className="px-3 py-1.5 gradient-btn-sm text-white rounded-lg transition-all"
        >
          + Add Position
        </button>
      </div>

      {experience.length === 0 ? (
        <p className="text-gray-400 text-sm">No experience added yet</p>
      ) : (
        experience.map((exp, index) => (
          <div key={index} className="bg-gray-700/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-white">Position {index + 1}</h4>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400">Company *</label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => onUpdate(index, "company", e.target.value)}
                  className="input w-full text-sm"
                  placeholder="e.g., Google"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Job Title *</label>
                <input
                  type="text"
                  value={exp.title}
                  onChange={(e) => onUpdate(index, "title", e.target.value)}
                  className="input w-full text-sm"
                  placeholder="e.g., Software Engineer"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400">Top Skills</label>
              <div className="flex gap-2 mb-2">
                <input
                  id={`skills-${index}`}
                  type="text"
                  onKeyDown={(e) => {
                    const value = (e.target as HTMLInputElement).value.trim();
                    if (e.key === "Enter" && value) {
                      e.preventDefault();
                      if (!exp.topSkills?.includes(value)) {
                        onUpdate(index, "topSkills", [
                          ...(exp.topSkills || []),
                          value,
                        ]);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }}
                  className="input flex-1 text-sm"
                  placeholder="Type skill and press enter"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById(`skills-${index}`) as HTMLInputElement;
                    if (input?.value.trim()) {
                      const value = input.value.trim();
                      if (!exp.topSkills?.includes(value)) {
                        onUpdate(index, "topSkills", [
                          ...(exp.topSkills || []),
                          value,
                        ]);
                        input.value = "";
                      }
                    }
                  }}
                  className="px-3 py-2 gradient-btn-sm text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {exp.topSkills && exp.topSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {exp.topSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600/30 text-emerald-300 text-xs rounded"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => {
                          const newSkills = [...(exp.topSkills || [])];
                          newSkills.splice(i, 1);
                          onUpdate(index, "topSkills", newSkills);
                        }}
                        className="hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400">Start Date</label>
                <input
                  type="text"
                  value={exp.startDate}
                  onChange={(e) => onUpdate(index, "startDate", e.target.value)}
                  className="input w-full text-sm"
                  placeholder="e.g., Jan 2020"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">End Date</label>
                <input
                  type="text"
                  value={exp.endDate || ""}
                  onChange={(e) => onUpdate(index, "endDate", e.target.value)}
                  className="input w-full text-sm"
                  placeholder="e.g., Present"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-400">
                  Description / Highlights *
                </label>
                <button
                  type="button"
                  onClick={() => handleAIGenerate(index)}
                  disabled={generatingIndex === index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white text-xs rounded transition-all disabled:cursor-not-allowed"
                >
                  {generatingIndex === index ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  {generatingIndex === index ? "Generating..." : "AI Generate"}
                </button>
              </div>
              <textarea
                value={(exp.highlights || []).join("\n")}
                onChange={(e) =>
                  onUpdate(index, "highlights", toHighlights(e.target.value))
                }
                className="input w-full text-sm"
                style={{ minHeight: "200px", height: "auto" }}
                placeholder="Use (•) bullet points or each line will be a separate bullet point."
              />
              <p className="text-xs text-gray-400 mt-1">
                Tip: Use action verbs and quantify achievements (e.g., "Improved
                performance by 40%")
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
