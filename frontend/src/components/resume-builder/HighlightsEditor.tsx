/* ===================================
Bullet Point (Highlights) Editor
Each added item appears as a bullet
point in the resume preview.
=================================== */
import { useState } from "react";
import { Plus, X } from "lucide-react";

interface HighlightsEditorProps {
  highlights: string[];
  onAdd: (text: string) => void;
  onRemove: (index: number) => void;
  placeholder?: string;
}

export default function HighlightsEditor({
  highlights,
  onAdd,
  onRemove,
  placeholder,
}: HighlightsEditorProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText("");
    setOpen(false);
  };

  return (
    <div>
      <div className="space-y-2">
        {(highlights || []).map((highlight, index) => (
          <div
            key={index}
            className="flex items-start gap-2 bg-gray-100 rounded-lg px-3 py-2"
          >
            <span className="text-green-600 mt-0.5 text-xs">•</span>
            <span className="flex-1 text-sm text-gray-700 break-words">
              {highlight}
            </span>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-gray-600 hover:text-red-600 mt-0.5 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {(highlights || []).length === 0 && (
          <p className="text-xs text-gray-500">
            No bullet points added yet.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700"
      >
        <Plus className="w-4 h-4" /> Add Bullet Point
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-xl border border-gray-200 w-full max-w-md p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900">
                Add Bullet Point
              </h4>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                placeholder ||
                "e.g. Increased website traffic by 40% through SEO optimization"
              }
              rows={3}
              autoFocus
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!text.trim()}
                className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
