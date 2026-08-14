/* ===================================
Achievements Form
=================================== */
import { Plus } from "lucide-react";
import { Input, Textarea } from "../ui/FormField";
import CollapsibleItem from "./CollapsibleItem";
import { Achievement } from "../../types";
import { sortItemsByDateDesc } from "../../utils/sort";
import AddButton from "../ui/AddButton";

interface AchievementsFormProps {
  achievements: Achievement[];
  onAdd: () => void;
  onUpdate: (index: number, patch: Partial<Achievement>) => void;
  onRemove: (index: number) => void;
}

export default function AchievementsForm({
  achievements,
  onAdd,
  onUpdate,
  onRemove,
}: AchievementsFormProps) {
  const sorted = sortItemsByDateDesc(achievements, (ach) => ach.date);
  return (
    <div className="space-y-3">
      {sorted.map((ach) => {
        const index = achievements.indexOf(ach);
        return (
          <CollapsibleItem
            key={index}
            title={ach.title || `Achievement ${index + 1}`}
            subtitle={ach.date || undefined}
            onRemove={() => onRemove(index)}
          >
          <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Title"
              value={ach.title || ""}
              onChange={(e) => onUpdate(index, { title: e.target.value })}
              placeholder="Winner, National Hackathon 2024"
            />
            <Input
              label="Date"
              value={ach.date || ""}
              onChange={(e) => onUpdate(index, { date: e.target.value })}
              placeholder="e.g. Jun 2024"
            />
            <div className="sm:col-span-2">
              <Textarea
                label="Description (optional)"
                value={ach.description || ""}
                onChange={(e) =>
                  onUpdate(index, { description: e.target.value })
                }
                rows={2}
                placeholder="Short description of the achievement"
              />
            </div>
          </div>
          </div>
          </CollapsibleItem>
        );
      })}

      <AddButton onClick={onAdd}>Add Achievement</AddButton>
    </div>
  );
}
