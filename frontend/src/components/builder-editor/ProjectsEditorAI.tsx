import { useState } from "react";
import { Sparkles, Loader2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { resumeBuilderApi } from "../../api/api";
import { AISectionSuggestion, Project } from "../../types";

interface ProjectsEditorProps {
  projects: Project[] | undefined;
  onAdd: () => void;
  onUpdate: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
}

export default function ProjectsEditorAI({
  projects = [],
  onAdd,
  onUpdate,
  onRemove,
}: ProjectsEditorProps) {
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);

  const toHighlights = (content: string): string[] =>
    content
      .split("\n")
      .map((line) => line.replace(/^[•\-\*]\s*/, "").trim())
      .filter(Boolean);

  const handleAIGenerate = async (index: number) => {
    const project = projects[index];

    if (!project.name?.trim()) {
      toast.error(
        "Please provide a Project Name first to generate highlights.",
      );
      return;
    }

    try {
      setGeneratingIndex(index);
      const response = await resumeBuilderApi.generateSection({
        section: "Project Description",
        context: {
          jobTitle: project.name,
          skills: project.technologies,
        },
      });

      const suggestion = response.data.data as AISectionSuggestion;
      onUpdate(index, "highlights", toHighlights(suggestion.content));
      toast.success("Project highlights generated!");
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
        <label className="text-sm font-medium text-gray-300">Projects</label>
        <button
          type="button"
          onClick={onAdd}
          className="px-3 py-1.5 gradient-btn-sm text-white rounded-lg transition-all"
        >
          + Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <p className="text-gray-400 text-sm">No projects added yet</p>
      ) : (
        <>
          {projects.map((project, index) => (
            <div
              key={index}
              className="bg-gray-700/50 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-white">Project {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-xs text-gray-400">Project Name *</label>
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) => onUpdate(index, "name", e.target.value)}
                  className="input w-full text-sm"
                  placeholder="e.g., E-commerce Platform"
                />
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
                    {generatingIndex === index
                      ? "Generating..."
                      : "AI Generate"}
                  </button>
                </div>
                <textarea
                  value={(project.highlights || []).join("\n")}
                  onChange={(e) =>
                    onUpdate(index, "highlights", toHighlights(e.target.value))
                  }
                  className="input w-full text-sm"
                  style={{ minHeight: "200px", height: "auto" }}
                  placeholder="Use (•) bullet points or each line will be a separate bullet point."
                />
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
