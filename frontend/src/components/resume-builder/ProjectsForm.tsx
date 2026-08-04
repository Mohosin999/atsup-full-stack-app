/* ===================================
Projects Form
=================================== */
import { Plus, Trash2 } from "lucide-react";
import { Input } from "../ui/FormField";
import HighlightsEditor from "./HighlightsEditor";
import { Project } from "../../types";

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
  const updateLink = (
    index: number,
    field: "live" | "github",
    value: string,
  ) =>
    onUpdate(index, {
      links: { ...(projects[index].links || {}), [field]: value },
    });

  return (
    <div className="space-y-3">
      {projects.map((proj, index) => (
        <div
          key={index}
          className="rounded-lg border border-gray-200 bg-gray-100 p-3 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">
              Project {index + 1}
            </span>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-gray-600 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Project Name"
                value={proj.name || ""}
                onChange={(e) => onUpdate(index, { name: e.target.value })}
                placeholder="E-commerce Platform"
              />
            </div>
            <Input
              label="Live Link"
              value={proj.links?.live || ""}
              onChange={(e) => updateLink(index, "live", e.target.value)}
              placeholder="https://example.com"
            />
            <Input
              label="GitHub Link"
              value={proj.links?.github || ""}
              onChange={(e) => updateLink(index, "github", e.target.value)}
              placeholder="https://github.com/johndoe/project"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Start Date
              </label>
              <input
                type="month"
                value={proj.startDate || ""}
                onChange={(e) =>
                  onUpdate(index, { startDate: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                End Date
              </label>
              <input
                type="month"
                value={proj.endDate || ""}
                disabled={!!proj.current}
                onChange={(e) => onUpdate(index, { endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={!!proj.current}
              onChange={(e) => onUpdate(index, { current: e.target.checked })}
              className="w-4 h-4 accent-green-500"
            />
            This project is ongoing
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Highlights / Bullet Points
            </label>
            <HighlightsEditor
              highlights={proj.highlights || []}
              onAdd={(text) =>
                onUpdate(index, {
                  highlights: [...(proj.highlights || []), text],
                })
              }
              onRemove={(i) =>
                onUpdate(index, {
                  highlights: (proj.highlights || []).filter(
                    (_, idx) => idx !== i,
                  ),
                })
              }
              placeholder="e.g. Designed a payment gateway handling 5k transactions per month"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-dashed border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600 transition-colors"
      >
        <Plus className="w-4 h-4" /> Add Project
      </button>
    </div>
  );
}
