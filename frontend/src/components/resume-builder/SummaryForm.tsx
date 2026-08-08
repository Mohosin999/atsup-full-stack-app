/* ===================================
Summary Form
=================================== */
import { Textarea } from "../ui/FormField";

interface SummaryFormProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SummaryForm({ value, onChange }: SummaryFormProps) {
  return (
    <Textarea
      label="Professional Summary"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      rows={5}
      placeholder="Write a brief summary of your professional background, key strengths, and career goals."
    />
  );
}
