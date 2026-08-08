/* ===================================
Education Form
=================================== */
import { Plus, Trash2 } from "lucide-react";
import { Input } from "../ui/FormField";
import { Education } from "../../types";

interface EducationFormProps {
  education: Education[];
  onAdd: () => void;
  onUpdate: (index: number, patch: Partial<Education>) => void;
  onRemove: (index: number) => void;
}

export default function EducationForm({
  education,
  onAdd,
  onUpdate,
  onRemove,
}: EducationFormProps) {
  return (
    <div className="space-y-3">
      {education.map((edu, index) => (
        <div
          key={index}
          className="rounded-lg border border-gray-200 bg-gray-100 p-3 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">
              Education {index + 1}
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
            <Input
              label="Degree / Certification"
              value={edu.degree || ""}
              onChange={(e) => onUpdate(index, { degree: e.target.value })}
              placeholder="B.Sc. in Computer Science"
            />
            <Input
              label="Institution"
              value={edu.institution || ""}
              onChange={(e) => onUpdate(index, { institution: e.target.value })}
              placeholder="University of Dhaka"
            />
            <div className="sm:col-span-2">
              <Input
                label="Year(s)"
                value={edu.date || ""}
                onChange={(e) => onUpdate(index, { date: e.target.value })}
                placeholder="2020 - 2024"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-dashed border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600 transition-colors"
      >
        <Plus className="w-4 h-4" /> Add Education
      </button>
    </div>
  );
}
