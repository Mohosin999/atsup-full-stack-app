/* ===================================
Certifications Form
=================================== */
import { Plus } from "lucide-react";
import { Input } from "../ui/FormField";
import CollapsibleItem from "./CollapsibleItem";
import { Certification } from "../../types";
import { sortItemsByDateDesc } from "../../utils/sort";
import AddButton from "../ui/AddButton";

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
              [cert.issuer].filter(Boolean).join(" · ") || undefined
            }
            onRemove={() => onRemove(index)}
          >
          <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Name"
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
              placeholder="e.g., May 2024"
            />
          </div>
          </div>
          </CollapsibleItem>
        );
      })}


      <AddButton onClick={onAdd}>Add Certification</AddButton>
    </div>
  );
}
