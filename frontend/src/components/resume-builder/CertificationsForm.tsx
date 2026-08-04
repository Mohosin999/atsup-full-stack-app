/* ===================================
Certifications Form
=================================== */
import { Plus, Trash2 } from "lucide-react";
import { Input } from "../ui/FormField";
import { Certification } from "../../types";

interface CertificationsFormProps {
  certifications: Certification[];
  onAdd: () => void;
  onUpdate: (index: number, patch: Partial<Certification>) => void;
  onRemove: (index: number) => void;
}

export default function CertificationsForm({
  certifications,
  onAdd,
  onUpdate,
  onRemove,
}: CertificationsFormProps) {
  return (
    <div className="space-y-3">
      {certifications.map((cert, index) => (
        <div
          key={index}
          className="rounded-lg border border-gray-200 bg-gray-100 p-3 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">
              Certification {index + 1}
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
                label="Certification Name"
                value={cert.name || ""}
                onChange={(e) => onUpdate(index, { name: e.target.value })}
                placeholder="AWS Certified Solutions Architect"
              />
            </div>
            <Input
              label="Issuer"
              value={cert.issuer || ""}
              onChange={(e) => onUpdate(index, { issuer: e.target.value })}
              placeholder="Amazon Web Services"
            />
            <Input
              label="Date"
              value={cert.date || ""}
              onChange={(e) => onUpdate(index, { date: e.target.value })}
              placeholder="2024"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-dashed border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600 transition-colors"
      >
        <Plus className="w-4 h-4" /> Add Certification
      </button>
    </div>
  );
}
