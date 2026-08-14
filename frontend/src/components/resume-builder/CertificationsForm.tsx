/* ===================================
Certifications Form
=================================== */
import { Plus } from "lucide-react";
import { Input } from "../ui/FormField";
import CollapsibleItem from "./CollapsibleItem";
import { Certification } from "../../types";
import { sortItemsByDateDesc } from "../../utils/sort";

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
  const sorted = sortItemsByDateDesc(certifications, (cert) => cert.date);
  return (
    <div className="space-y-3">
      {sorted.map((cert) => {
        const index = certifications.indexOf(cert);
        return (
          <CollapsibleItem
            key={index}
            title={cert.name || `Certification ${index + 1}`}
            subtitle={
              [cert.issuer, cert.date].filter(Boolean).join(" · ") || undefined
            }
            onRemove={() => onRemove(index)}
          >
          <div className="space-y-4">
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
          </CollapsibleItem>
        );
      })}

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
