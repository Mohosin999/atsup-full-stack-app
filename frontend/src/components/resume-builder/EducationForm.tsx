/* ===================================
Education Form
=================================== */
import { Plus } from "lucide-react";
import { Input } from "../ui/FormField";
import CollapsibleItem from "./CollapsibleItem";
import { Education } from "../../types";
import { sortItemsByDateDesc } from "../../utils/sort";
import AddButton from "../ui/AddButton";

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
  const sorted = sortItemsByDateDesc(education, (edu) => edu.startDate);
  return (
    <div className="space-y-3">
      {sorted.map((edu) => {
        const index = education.indexOf(edu);
        return (
          <CollapsibleItem
            key={index}
            title={
              edu.institution ||
              [edu.degree, edu.areaOfStudy].filter(Boolean).join(" · ") ||
              `Education ${index + 1}`
            }
            subtitle={
              [edu.areaOfStudy].filter(Boolean).join(" · ") || undefined
            }
            onRemove={() => onRemove(index)}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <Input
                    label="Institution"
                    value={edu.institution || ""}
                    onChange={(e) =>
                      onUpdate(index, { institution: e.target.value })
                    }
                    placeholder="Agricultural University, Mymensingh"
                  />
                </div>
                <Input
                  label="Degree"
                  value={edu.degree || ""}
                  onChange={(e) => onUpdate(index, { degree: e.target.value })}
                  placeholder="Bachelor of Science (BS)"
                />
                <Input
                  label="Area of Study"
                  value={edu.areaOfStudy || ""}
                  onChange={(e) =>
                    onUpdate(index, { areaOfStudy: e.target.value })
                  }
                  placeholder="Science"
                />
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={edu.startDate || ""}
                    onChange={(e) =>
                      onUpdate(index, { startDate: e.target.value })
                    }
                    placeholder="e.g. Jan 2020"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="text"
                    value={edu.endDate || ""}
                    onChange={(e) =>
                      onUpdate(index, { endDate: e.target.value })
                    }
                    placeholder="e.g. July 2025 / Present"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="GPA / Score (optional)"
                    value={edu.gpa || ""}
                    onChange={(e) => onUpdate(index, { gpa: e.target.value })}
                    placeholder="4.17"
                  />
                </div>
              </div>
            </div>
          </CollapsibleItem>
        );
      })}

      <AddButton onClick={onAdd}>Add Education</AddButton>
    </div>
  );
}
