/* ===================================
Work Experience Form
=================================== */
import { Plus } from "lucide-react";
import { Input } from "../ui/FormField";
import HighlightsEditor from "./HighlightsEditor";
import CollapsibleItem from "./CollapsibleItem";
import { Experience } from "../../types";
import { sortItemsByDateDesc } from "../../utils/sort";

interface ExperienceFormProps {
  experience: Experience[];
  onAdd: () => void;
  onUpdate: (index: number, patch: Partial<Experience>) => void;
  onRemove: (index: number) => void;
}

export default function ExperienceForm({
  experience,
  onAdd,
  onUpdate,
  onRemove,
}: ExperienceFormProps) {
  const sorted = sortItemsByDateDesc(experience, (exp) => exp.startDate);
  return (
    <div className="space-y-3">
      {sorted.map((exp) => {
        const index = experience.indexOf(exp);
        return (
          <CollapsibleItem
            key={index}
            title={
              exp.title ||
              exp.company ||
              `Position ${index + 1}`
            }
            subtitle={
              [exp.company, exp.location].filter(Boolean).join(", ") ||
              undefined
            }
            onRemove={() => onRemove(index)}
          >
          <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Job Title"
              value={exp.title || ""}
              onChange={(e) => onUpdate(index, { title: e.target.value })}
              placeholder="Software Engineer"
            />
            <Input
              label="Company"
              value={exp.company || ""}
              onChange={(e) => onUpdate(index, { company: e.target.value })}
              placeholder="Google"
            />
            <div className="sm:col-span-2">
              <Input
                label="Location"
                value={exp.location || ""}
                onChange={(e) => onUpdate(index, { location: e.target.value })}
                placeholder="Dhaka, Bangladesh"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Start Date
              </label>
              <input
                type="month"
                value={exp.startDate || ""}
                onChange={(e) => onUpdate(index, { startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                End Date
              </label>
              <input
                type="month"
                value={exp.endDate || ""}
                disabled={!!exp.current}
                onChange={(e) => onUpdate(index, { endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={!!exp.current}
              onChange={(e) => onUpdate(index, { current: e.target.checked })}
              className="w-4 h-4 accent-green-500"
            />
            I currently work here
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Highlights / Bullet Points
            </label>
            <HighlightsEditor
              highlights={exp.highlights || []}
              onAdd={(text) =>
                onUpdate(index, {
                  highlights: [...(exp.highlights || []), text],
                })
              }
              onRemove={(i) =>
                onUpdate(index, {
                  highlights: (exp.highlights || []).filter(
                    (_, idx) => idx !== i,
                  ),
                })
              }
              placeholder="e.g. Built a REST API serving 10k requests per day"
            />
          </div>
          </div>
          </CollapsibleItem>
        );
      })}

      <button
        type="button"
        onClick={onAdd}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-dashed border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600 transition-colors"
      >
        <Plus className="w-4 h-4" /> Add Work Experience
      </button>
    </div>
  );
}
