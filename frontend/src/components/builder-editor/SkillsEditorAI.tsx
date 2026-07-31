import { useState } from "react";
import { Sparkles, Loader2, Plus, X } from "lucide-react";
import { toast } from "react-toastify";
import { resumeBuilderApi } from "../../api/api";
import { AISectionSuggestion } from "../../types";

interface SkillsEditorProps {
  skills: string[];
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
  jobTitle?: string;
}

export default function SkillsEditorAI({
  skills,
  onAddSkill,
  onRemoveSkill,
  jobTitle,
}: SkillsEditorProps) {
  const [newSkill, setNewSkill] = useState("");
  const [generating, setGenerating] = useState(false);

  const capitalizeSkill = (skill: string): string => {
    return skill.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const cleanSkillName = (skill: string): string => {
    const cleaned = skill
      .replace(/\s+(with|and|using|in|of|for|to)\s+/gi, " ")
      .replace(
        /^(experience|knowledge|skills?|proficiency)\s+(in|with|of)?/gi,
        "",
      )
      .replace(/\s+(experience|knowledge|skills?|proficiency)$/gi, "")
      .trim();
    return cleaned.length > 2 && cleaned.length < 40
      ? capitalizeSkill(cleaned)
      : "";
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      onAddSkill(capitalizeSkill(newSkill.trim()));
      setNewSkill("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handler();
    }
  };

  const handleAISuggest = async () => {
    try {
      setGenerating(true);
      const response = await resumeBuilderApi.generateSection({
        section: "Technical Skills",
        context: {
          jobTitle,
        },
      });

      const suggestion = response.data.data as AISectionSuggestion;
      const suggestedSkills = suggestion.content
        .split(/[,\n•]/)
        .map((s: string) => cleanSkillName(s))
        .filter((s: string) => s.length > 0)
        .filter(
          (s: string) =>
            !s.match(
              /^(hands?|typing|developing|working|building|creating|experience|knowledge)$/i,
            ),
        )
        .filter((s: string) => !s.toLowerCase().includes("hands"))
        .filter((s: string) => !s.toLowerCase().includes("developing"))
        .filter((s: string) => !s.toLowerCase().includes("pipelines"))
        .filter((s: string) => !s.toLowerCase().includes("containerization"));

      const uniqueSkills = [...new Set(suggestedSkills)];
      uniqueSkills.slice(0, 10).forEach((skill: string) => {
        if (!skills.includes(skill)) {
          onAddSkill(skill);
        }
      });

      toast.success(`${Math.min(10, uniqueSkills.length)} skills added!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to suggest skills");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">Skills</label>
          <button
            type="button"
            onClick={handleAISuggest}
            disabled={generating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white text-sm rounded-lg transition-all disabled:cursor-not-allowed"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {generating ? "Generating..." : "AI Suggest"}
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, handleAddSkill)}
            className="input flex-1 text-sm"
            placeholder="e.g., React, Node.js, Python"
          />
          <button
            type="button"
            onClick={handleAddSkill}
            className="px-3 py-2 gradient-btn-sm text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-900/30 border border-emerald-500/30 text-emerald-300 rounded-lg text-sm"
            >
              {skill}
              <button
                type="button"
                onClick={() => onRemoveSkill(skill)}
                className="hover:text-emerald-100 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
