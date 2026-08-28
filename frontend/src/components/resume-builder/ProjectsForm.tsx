/* ===================================
Projects Form
=================================== */
import { Plus } from "lucide-react";
import { Input, DateRangeInput } from "../ui/FormField";
import HighlightsEditor from "./HighlightsEditor";
import CollapsibleItem from "./CollapsibleItem";
import { Project } from "../../types";
import { sortItemsByDateDesc } from "../../utils/sort";
import AddButton from "../ui/AddButton";

interface ProjectsFormProps {
  projects: Project[];
  onAdd: () => void;
  onUpdate: (index: number, patch: Partial<Project>) => void;
  onRemove: (index: number) => void;
}

export default function ProjectsForm({
  projects,
  onAdd,
  onUpdate,
  onRemove,
}: ProjectsFormProps) {
  const sorted = sortItemsByDateDesc(projects, (proj) => proj.startDate);
  const updateLink = (index: number, value: string) =>
    onUpdate(index, {
      links: { ...(projects[index].links || {}), live: value },
    });

  return (
    <div className="space-y-3">
      {sorted.map((proj) => {
        const index = projects.indexOf(proj);
        return (
          <CollapsibleItem
            key={index}
            title={proj.name || `Project ${index + 1}`}
            subtitle={
              [proj.startDate, proj.current ? "Present" : proj.endDate]
                .filter(Boolean)
                .join(" - ") || undefined
            }
            onRemove={() => onRemove(index)}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Project Name"
                    value={proj.name || ""}
                    onChange={(e) => onUpdate(index, { name: e.target.value })}
                    placeholder="E-commerce Platform"
                  />
                <Input
                  label="URL"
                  value={proj.links?.live || ""}
                  onChange={(e) => updateLink(index, e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <DateRangeInput
                startDate={proj.startDate}
                endDate={proj.endDate}
                onStartChange={(v) => onUpdate(index, { startDate: v })}
                onEndChange={(v) => onUpdate(index, { endDate: v })}
                endDisabled={!!proj.current}
                endPlaceholder="e.g. July 2025 / Ongoing"
              />

              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Bullet Points
                </label>
                <HighlightsEditor
                  highlights={proj.highlights || []}
                  onAdd={(text) =>
                    onUpdate(index, {
                      highlights: [...(proj.highlights || []), text],
                    })
                  }
                  onUpdate={(i, edited) =>
                    onUpdate(index, {
                      highlights: (proj.highlights || []).map((h, idx) =>
                        idx === i ? edited : h,
                      ),
                    })
                  }
                  onRemove={(i) =>
                    onUpdate(index, {
                      highlights: (proj.highlights || []).filter(
                        (_, idx) => idx !== i,
                      ),
                    })
                  }
                  onReorder={(highlights) => onUpdate(index, { highlights })}
                  placeholder="e.g. Designed a payment gateway handling 5k transactions per month"
                />
              </div>
            </div>
          </CollapsibleItem>
        );
      })}

      <AddButton onClick={onAdd}>Add Project</AddButton>
    </div>
  );
}
