/* ===================================
Work Experience Form
=================================== */
import { Plus } from "lucide-react";
import { Input, DateRangeInput } from "../ui/FormField";
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
                  className="rounded-md"
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

              <DateRangeInput
                startDate={exp.startDate}
                endDate={exp.endDate}
                onStartChange={(v) => onUpdate(index, { startDate: v })}
                onEndChange={(v) => onUpdate(index, { endDate: v })}
                endDisabled={!!exp.current}
                endPlaceholder="e.g. July 2025 / Present"
              />

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
                <label className="block text-xs md:text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
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
