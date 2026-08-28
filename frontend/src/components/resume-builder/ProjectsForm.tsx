/* ===================================
Projects Form
=================================== */
import { Plus } from "lucide-react";
import { Input } from "../ui/FormField";
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={proj.startDate || ""}
                    onChange={(e) =>
                      onUpdate(index, { startDate: e.target.value })
                    }
                    placeholder="e.g. Jan 2020"
                    className="w-full px-3 py-2 lg:py-3 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="text"
                    value={proj.endDate || ""}
                    disabled={!!proj.current}
                    onChange={(e) =>
                      onUpdate(index, { endDate: e.target.value })
                    }
                    placeholder="e.g. July 2025 / Ongoing"
                    className="w-full px-3 py-2 lg:py-3 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                  />
                </div>
              </div>

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
