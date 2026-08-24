import { motion, AnimatePresence } from "framer-motion";
import { X, LayoutTemplate, Type, Sparkles } from "lucide-react";

interface FormattingTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LAYOUT_TIPS = [
  "Use a single-column layout — ATS parsers read top-to-bottom, left-to-right.",
  "Avoid multi-column layouts, sidebars and tables that break text flow.",
  "Never place important text inside tables, text boxes, images or icons.",
  "Keep the document free of photos, graphics and decorative elements.",
  "Use standard section headings (Experience, Education, Skills) — no fancy icons.",
];

const FONT_TIPS = [
  "Use ATS-friendly fonts: Arial, Calibri, Times New Roman or Verdana.",
  "Body text should be 10–12pt for easy readability and parsing.",
  "Use a single font family across the whole resume — avoid mixing styles.",
];

export default function FormattingTipsModal({
  isOpen,
  onClose,
}: FormattingTipsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100 bg-green-100">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 leading-tight">
                    Formatting Tips
                  </h3>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Follow these free tips to make your resume perfectly
                    ATS-friendly.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Layout tips */}
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                  <LayoutTemplate className="w-4 h-4" />
                  Layout Tips
                </p>
                <ul className="space-y-2.5">
                  {LAYOUT_TIPS.map((tip) => (
                    <li
                      key={tip}
                      className="flex items-center gap-2.5 text-[13px] lg:text-sm text-gray-600 leading-snug"
                    >
                      <span className="ml-5 w-1.5 h-1.5 bg-gray-500 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Font tips */}
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                  <Type className="w-4 h-4" />
                  Font Tips
                </p>
                <ul className="space-y-2.5">
                  {FONT_TIPS.map((tip) => (
                    <li
                      key={tip}
                      className="flex items-center gap-2.5 text-[13px] lg:text-sm text-gray-700 leading-snug"
                    >
                      <span className="ml-5 w-1.5 h-1.5 bg-gray-500 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
