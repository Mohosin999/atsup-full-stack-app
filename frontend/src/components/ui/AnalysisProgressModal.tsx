

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, Circle, Sparkles } from "lucide-react";
import { clsx } from "clsx";

export interface PipelineStep {
  id: string;
  label: string;
}

interface AnalysisProgressModalProps {
  isOpen: boolean;
  steps: PipelineStep[];
  activeStep: number;
  completedSteps: string[];
  currentMessage: string;
}

export default function AnalysisProgressModal({
  isOpen,
  steps,
  activeStep,
  completedSteps,
  currentMessage,
}: AnalysisProgressModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const progress = steps.length
    ? Math.round((completedSteps.length / steps.length) * 100)
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-gray-50/70 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 220 }}
            className="bg-white border border-gray-200 rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Analyzing your resume
                </h3>
              </div>
              {/* <Loader2 className="w-5 h-5 text-green-600 animate-spin" /> */}
            </div>

            <div className="space-y-3 mb-6">
              {steps.map((step, idx) => {
                const isDone = completedSteps.includes(step.id);
                const isActive = activeStep === idx && !isDone;
                return (
                  <div key={step.id} className="flex items-center gap-3">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    ) : isActive ? (
                      <Loader2 className="w-5 h-5 text-green-600 animate-spin shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-600 shrink-0" />
                    )}
                    <span
                      className={clsx(
                        "text-sm font-medium transition-colors",
                        isDone
                          ? "text-green-600"
                          : isActive
                            ? "text-gray-900"
                            : "text-gray-500",
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-6">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="relative h-14 bg-white/70 border border-gray-200/60 rounded-xl overflow-hidden flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentMessage}
                  initial={{ y: 64, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -64, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="text-sm text-green-700 px-4 text-center"
                >
                  {currentMessage}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
