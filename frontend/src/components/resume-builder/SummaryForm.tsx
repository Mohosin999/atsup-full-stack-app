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
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      rows={8}
      placeholder="Write a brief summary with highlights of your top skills and achievements."
      className="rounded-md"
    />
  );
}
