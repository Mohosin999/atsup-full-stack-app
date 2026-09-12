// import { useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Loader2, CheckCircle2, Circle, Sparkles } from "lucide-react";
// import { clsx } from "clsx";

// export interface PipelineStep {
//   id: string;
//   label: string;
// }

// interface AnalysisProgressModalProps {
//   isOpen: boolean;
//   steps: PipelineStep[];
//   activeStep: number;
//   completedSteps: string[];
//   currentMessage: string;
// }

// export default function AnalysisProgressModal({
//   isOpen,
//   steps,
//   activeStep,
//   completedSteps,
//   currentMessage,
// }: AnalysisProgressModalProps) {
//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = "hidden";
//     }
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [isOpen]);

//   const progress = steps.length
//     ? Math.round((completedSteps.length / steps.length) * 100)
//     : 0;

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           className="fixed inset-0 z-50 bg-gray-50/70 dark:bg-gray-800/70 backdrop-blur-md flex items-center justify-center p-4"
//         >
//           <motion.div
//             initial={{ y: 90, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: 90, opacity: 0 }}
//             transition={{ type: "spring", damping: 22, stiffness: 220 }}
//             className="bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-2xl shadow-2xl max-w-md w-full p-6"
//           >
//             <div className="flex items-center justify-between mb-5">
//               <div className="flex items-center gap-2">
//                 <Sparkles className="w-5 h-5 text-cyan-600" />
//                 <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
//                   Analyzing your resume
//                 </h3>
//               </div>
//               {/* <Loader2 className="w-5 h-5 text-cyan-600 animate-spin" /> */}
//             </div>

//             <div className="space-y-3 mb-6">
//               {steps.map((step, idx) => {
//                 const isDone = completedSteps.includes(step.id);
//                 const isActive = activeStep === idx && !isDone;
//                 return (
//                   <div key={step.id} className="flex items-center gap-3">
//                     {isDone ? (
//                       <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0" />
//                     ) : isActive ? (
//                       <Loader2 className="w-5 h-5 text-cyan-600 animate-spin shrink-0" />
//                     ) : (
//                       <Circle className="w-5 h-5 text-gray-600 dark:text-gray-400 shrink-0" />
//                     )}
//                     <span
//                       className={clsx(
//                         "text-sm font-medium transition-colors",
//                         isDone
//                           ? "text-cyan-600"
//                           : isActive
//                             ? "text-gray-800 dark:text-gray-100"
//                             : "text-gray-500 dark:text-gray-400",
//                       )}
//                     >
//                       {step.label}
//                     </span>
//                   </div>
//                 );
//               })}
//             </div>

//             <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-6">
//               <motion.div
//                 className="h-full bg-gradient-to-r from-cyan-500 to-cyan-500"
//                 initial={{ width: 0 }}
//                 animate={{ width: `${progress}%` }}
//                 transition={{ duration: 0.5 }}
//               />
//             </div>

//             <div className="relative h-14 bg-white/70 dark:bg-gray-800/70 border border-gray-200/60 dark:border-gray-700/60 rounded-xl overflow-hidden flex items-center justify-center">
//               <AnimatePresence mode="wait">
//                 <motion.p
//                   key={currentMessage}
//                   initial={{ y: 64, opacity: 0 }}
//                   animate={{ y: 0, opacity: 1 }}
//                   exit={{ y: -64, opacity: 0 }}
//                   transition={{ duration: 0.4, ease: "easeInOut" }}
//                   className="text-sm text-cyan-700 px-4 text-center"
//                 >
//                   {currentMessage}
//                 </motion.p>
//               </AnimatePresence>
//             </div>
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }

import { useMemo } from "react";
import { FileText, Briefcase, ScanText } from "lucide-react";

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

/**
 * AnalysisProgressModal
 *
 * Same props as the original component (drop-in replacement):
 *   isOpen, steps, activeStep, completedSteps, currentMessage
 *
 * Design idea: instead of listing pipeline steps (which exposes the
 * machinery and pulls focus away), the two inputs — resume and job
 * description — visually flow toward a single glowing core where they're
 * being read together. Progress is expressed as light traveling into that
 * core, not as a checklist. The only text that changes is the one-line
 * narration, so there is exactly one thing to look at.
 */
export default function AnalysisProgressModal({
  isOpen,
  steps,
  activeStep,
  completedSteps,
  currentMessage,
  simProgress = 0,
}: AnalysisProgressModalProps) {
  const total = steps?.length ?? 0;
  const doneCount = completedSteps?.length ?? 0;
  const realProgress = total ? doneCount / total : 0;
  const progress = Math.max(realProgress, simProgress / 100);
  const percent = Math.round(progress * 100);

  // Split pipeline stages across the two feed lines (left = resume, right = JD)
  const { leftNodes, rightNodes } = useMemo(() => {
    const mid = Math.ceil(total / 2);
    const left = Array.from({ length: mid });
    const right = Array.from({ length: total - mid });
    return { leftNodes: left, rightNodes: right };
  }, [total]);

  // Deterministic ambient particles (stable across re-renders)
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        left: (i * 37) % 100,
        top: (i * 53) % 100,
        delay: (i % 6) * 0.4,
        size: 2 + (i % 3),
      })),
    [],
  );

  if (!isOpen) return null;

  const r = 38;
  const circumference = 2 * Math.PI * r;
  const dashoffset = circumference * (1 - progress);

  const nodeState = (idx: number, offset: number) => {
    const globalIdx = offset + idx;
    if (globalIdx < doneCount) return "done";
    if (globalIdx === activeStep) return "active";
    return "pending";
  };

  return (
    <div className="arpm-scrim">
      <style>{`
        .arpm-scrim {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(6, 8, 16, 0.72);
          backdrop-filter: blur(10px);
        }
        .arpm-card {
          position: relative;
          width: 100%;
          max-width: 460px;
          border-radius: 22px;
          padding: 40px 28px 32px;
          background:
            radial-gradient(120% 140% at 50% -10%, rgba(79,209,197,0.10), transparent 60%),
            #0d1020;
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow: 0 30px 80px rgba(0,0,0,0.55);
          overflow: hidden;
          animation: arpm-fadein 0.45s cubic-bezier(.2,.8,.2,1) both;
        }
        .arpm-field {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .arpm-dot {
          position: absolute;
          border-radius: 999px;
          background: rgba(255,255,255,0.5);
          animation: arpm-twinkle 3.6s ease-in-out infinite;
        }
        .arpm-stage {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          margin-bottom: 28px;
          height: 132px;
        }
        .arpm-doc {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: 64px;
          z-index: 2;
        }
        .arpm-doc-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .arpm-doc-label {
          font: 500 11px/1 system-ui, sans-serif;
          color: rgba(235,235,245,0.55);
          letter-spacing: 0.01em;
        }
        .arpm-beam {
          position: relative;
          flex: 1;
          height: 2px;
          margin: 0 -2px;
          top: -18px;
          background-image: repeating-linear-gradient(
            90deg,
            var(--beam-color) 0px,
            var(--beam-color) 6px,
            transparent 6px,
            transparent 16px
          );
          background-size: 40px 2px;
          opacity: 0.55;
        }
        .arpm-beam--left { animation: arpm-flow-right 1.1s linear infinite; }
        .arpm-beam--right { animation: arpm-flow-left 1.1s linear infinite; }
        .arpm-nodes {
          position: absolute;
          top: -32px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-evenly;
        }
        .arpm-node {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: rgba(255,255,255,0.15);
          transition: background 0.4s ease, box-shadow 0.4s ease, transform 0.4s ease;
        }
        .arpm-node.done {
          background: var(--beam-color);
          box-shadow: 0 0 8px var(--beam-color);
          transform: scale(1.15);
        }
        .arpm-node.active {
          background: var(--beam-color);
          box-shadow: 0 0 10px var(--beam-color);
          animation: arpm-twinkle 0.9s ease-in-out infinite;
        }
        .arpm-core-wrap {
          position: relative;
          width: 96px;
          height: 96px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3;
        }
        .arpm-ring {
          position: absolute;
          inset: 0;
          transform: rotate(-90deg);
        }
        .arpm-core {
          width: 56px;
          height: 56px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 35% 30%, #6fe3d6, #2fb6a8 65%, #1c8f84);
          animation: arpm-pulse-core 2.4s ease-in-out infinite;
          transition: transform 0.6s cubic-bezier(.2,.8,.2,1);
        }
        .arpm-percent {
          margin-top: 6px;
          text-align: center;
          font: 600 12px/1 system-ui, sans-serif;
          color: rgba(200,240,235,0.65);
          letter-spacing: 0.02em;
        }
        .arpm-headline {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 21px;
          font-weight: 600;
          text-align: center;
          color: #f4f2ec;
          letter-spacing: -0.01em;
          margin: 4px 0 6px;
        }
        .arpm-message-box {
          position: relative;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 2px;
        }
        .arpm-message {
          font: 400 13.5px/1.4 system-ui, sans-serif;
          color: rgba(210,212,224,0.72);
          text-align: center;
          animation: arpm-message-in 0.4s ease both;
        }

        @keyframes arpm-fadein {
          from { opacity: 0; transform: translateY(14px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes arpm-pulse-core {
          0%, 100% { box-shadow: 0 0 0 0 rgba(79,209,197,0.45); }
          50% { box-shadow: 0 0 0 16px rgba(79,209,197,0); }
        }
        @keyframes arpm-flow-right {
          from { background-position: 0 0; }
          to { background-position: 40px 0; }
        }
        @keyframes arpm-flow-left {
          from { background-position: 0 0; }
          to { background-position: -40px 0; }
        }
        @keyframes arpm-twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.85; }
        }
        @keyframes arpm-message-in {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .arpm-beam--left, .arpm-beam--right, .arpm-core, .arpm-dot, .arpm-node.active {
            animation: none !important;
          }
        }
      `}</style>

      <div className="arpm-card">
        <div className="arpm-field">
          {particles.map((p, i) => (
            <span
              key={i}
              className="arpm-dot"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: p.size,
                height: p.size,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        <div className="arpm-stage">
          <div className="arpm-doc">
            <div
              className="arpm-doc-icon"
              style={{ background: "rgba(232,163,61,0.14)" }}
            >
              <FileText size={20} color="#e8a33d" strokeWidth={1.8} />
            </div>
            <span className="arpm-doc-label">Your resume</span>
          </div>

          <div
            className="arpm-beam arpm-beam--left"
            style={{ "--beam-color": "#e8a33d" } as React.CSSProperties}
          >
            <div className="arpm-nodes">
              {leftNodes.map((_, i) => (
                <span
                  key={i}
                  className={`arpm-node ${nodeState(i, 0)}`}
                  style={{ "--beam-color": "#e8a33d" } as React.CSSProperties}
                />
              ))}
            </div>
          </div>

          <div className="arpm-core-wrap">
            <svg
              className="arpm-ring"
              width="96"
              height="96"
              viewBox="0 0 96 96"
            >
              <circle
                cx="48"
                cy="48"
                r={r}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="3"
              />
              <circle
                cx="48"
                cy="48"
                r={r}
                fill="none"
                stroke="#4fd1c5"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashoffset}
                style={{ transition: "stroke-dashoffset 0.6s ease" }}
              />
            </svg>
            <div
              className="arpm-core"
              style={{ transform: `scale(${1 + progress * 0.12})` }}
            >
              <ScanText size={22} color="#04201c" strokeWidth={2} />
            </div>
          </div>

          <div
            className="arpm-beam arpm-beam--right"
            style={{ "--beam-color": "#7c6cf6" } as React.CSSProperties}
          >
            <div className="arpm-nodes">
              {rightNodes.map((_, i) => (
                <span
                  key={i}
                  className={`arpm-node ${nodeState(i, leftNodes.length)}`}
                  style={{ "--beam-color": "#7c6cf6" } as React.CSSProperties}
                />
              ))}
            </div>
          </div>

          <div className="arpm-doc">
            <div
              className="arpm-doc-icon"
              style={{ background: "rgba(124,108,246,0.14)" }}
            >
              <Briefcase size={20} color="#a89bff" strokeWidth={1.8} />
            </div>
            <span className="arpm-doc-label">The role</span>
          </div>
        </div>

        <div className="arpm-percent">{percent}%</div>
        <p className="arpm-headline">Reading between the lines</p>
        <div className="arpm-message-box">
          <p key={currentMessage} className="arpm-message">
            {currentMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
