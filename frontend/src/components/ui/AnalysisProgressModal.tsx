import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, Circle } from "lucide-react";

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
  simProgress?: number;
}

export default function AnalysisProgressModal({
  isOpen,
  steps,
  activeStep,
  completedSteps,
  currentMessage,
  simProgress = 0,
}: AnalysisProgressModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const total = steps?.length ?? 0;
  const doneCount = completedSteps?.length ?? 0;
  const realProgress = total ? doneCount / total : 0;
  const progress = Math.max(realProgress, simProgress / 100);
  const percent = Math.round(Math.min(progress, 1) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/50 backdrop-blur-[2px]"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl max-w-md w-full p-8"
          >
            {/* General spinner */}
            <div className="flex flex-col items-center">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-stone-700 dark:border-lime-300" />
                <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  {percent}%
                </span>
              </div>

              <h3 className="font-fraunces mt-5 text-xl text-stone-900 dark:text-stone-50 text-center">
                Analyzing your resume
              </h3>
              <p
                key={currentMessage}
                className="font-plex mt-1.5 text-sm text-stone-500 dark:text-stone-400 text-center min-h-[20px]"
              >
                {currentMessage}
              </p>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden mt-5">
              <div
                className="h-full bg-stone-900 dark:bg-lime-300 rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>

            {/* Steps */}
            <div className="space-y-3 mt-6">
              {steps.map((step, idx) => {
                const isDone = completedSteps.includes(step.id);
                const isActive = activeStep === idx && !isDone;
                return (
                  <div key={step.id} className="flex items-center gap-3">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-lime-600 dark:text-lime-300 shrink-0" />
                    ) : isActive ? (
                      <Loader2 className="w-5 h-5 text-stone-900 dark:text-lime-300 animate-spin shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-stone-300 dark:text-stone-600 shrink-0" />
                    )}
                    <span
                      className={`font-plex text-sm font-medium ${
                        isDone
                          ? "text-lime-600 dark:text-lime-300"
                          : isActive
                            ? "text-stone-900 dark:text-stone-100"
                            : "text-stone-400 dark:text-stone-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
