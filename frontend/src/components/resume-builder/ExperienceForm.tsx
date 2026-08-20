/* ===================================
Work Experience Form
=================================== */
import { Plus } from "lucide-react";
import { Input } from "../ui/FormField";
import HighlightsEditor from "./HighlightsEditor";
import CollapsibleItem from "./CollapsibleItem";
import { Experience } from "../../types";
import { sortItemsByDateDesc } from "../../utils/sort";
import AddButton from "../ui/AddButton";

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
            title={exp.title || exp.company || `Position ${index + 1}`}
            subtitle={
              [exp.company].filter(Boolean).join(", ") ||
              undefined
            }
            onRemove={() => onRemove(index)}
          >
            <div className="space-y-4">
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
                    onChange={(e) =>
                      onUpdate(index, { location: e.target.value })
                    }
                    placeholder="city, state"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={exp.startDate || ""}
                    onChange={(e) =>
                      onUpdate(index, { startDate: e.target.value })
                    }
                    placeholder="e.g. Jan 2020"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="text"
                    value={exp.endDate || ""}
                    disabled={!!exp.current}
                    onChange={(e) =>
                      onUpdate(index, { endDate: e.target.value })
                    }
                    placeholder="e.g. July 2025 / Present"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* <label className="inline-flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!exp.current}
                  onChange={(e) =>
                    onUpdate(index, { current: e.target.checked })
                  }
                  className="w-4 h-4 text-gray-800 bg-white"
                />
                I currently work here
              </label> */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Bullet Points
                </label>
                <HighlightsEditor
                  highlights={exp.highlights || []}
                  onAdd={(text) =>
                    onUpdate(index, {
                      highlights: [...(exp.highlights || []), text],
                    })
                  }
                  onUpdate={(i, edited) =>
                    onUpdate(index, {
                      highlights: (exp.highlights || []).map((h, idx) =>
                        idx === i ? edited : h,
                      ),
                    })
                  }
              onRemove={(i) =>
                onUpdate(index, {
                  highlights: (exp.highlights || []).filter(
                    (_, idx) => idx !== i,
                  ),
                })
              }
              onReorder={(highlights) =>
                onUpdate(index, { highlights })
              }
                />
              </div>
            </div>
          </CollapsibleItem>
        );
      })}

      <AddButton onClick={onAdd}>Add Work Experience</AddButton>
    </div>
  );
}
