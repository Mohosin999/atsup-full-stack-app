import { useMemo } from "react";
import { PenLine, CheckCircle2, Loader2, Circle } from "lucide-react";

export interface RewriteStep {
  id: string;
  label: string;
}

interface RewriteProgressModalProps {
  isOpen: boolean;
  steps: RewriteStep[];
  activeStep: number;
  completedSteps: string[];
  currentMessage: string;
  simProgress?: number;
}

/**
 * RewriteProgressModal
 *
 * Same props as AnalysisProgressModal (drop-in replacement) but with a
 * "writing" concept: a resume paper whose lines get typed in front of you,
 * a floating pen, violet progress ring + bar and a single narration line.
 */
export default function RewriteProgressModal({
  isOpen,
  steps,
  activeStep,
  completedSteps,
  currentMessage,
  simProgress = 0,
}: RewriteProgressModalProps) {
  const total = steps?.length ?? 0;
  const doneCount = completedSteps?.length ?? 0;
  const realProgress = total ? doneCount / total : 0;
  const progress = Math.max(realProgress, simProgress / 100);
  const percent = Math.round(Math.min(progress, 1) * 100);

  const particles = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, i) => ({
        left: (i * 41) % 100,
        top: (i * 59) % 100,
        delay: (i % 6) * 0.4,
        size: 2 + (i % 3),
      })),
    [],
  );

  const lines = useMemo(
    () => [92, 100, 84, 96, 68, 90, 95, 62],
    [],
  );
  const visibleCount = Math.floor(progress * lines.length);

  if (!isOpen) return null;

  const r = 30;
  const circumference = 2 * Math.PI * r;
  const dashoffset = circumference * (1 - Math.min(progress, 1));

  return (
    <div className="rwpm-scrim">
      <style>{`
        .rwpm-scrim {
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
        .rwpm-card {
          position: relative;
          width: 100%;
          max-width: 460px;
          border-radius: 22px;
          padding: 36px 28px 30px;
          background:
            radial-gradient(120% 140% at 50% -10%, rgba(139,92,246,0.14), transparent 60%),
            #0d1020;
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow: 0 30px 80px rgba(0,0,0,0.55);
          overflow: hidden;
          animation: rwpm-fadein 0.45s cubic-bezier(.2,.8,.2,1) both;
        }
        .rwpm-field { position: absolute; inset: 0; pointer-events: none; }
        .rwpm-dot {
          position: absolute;
          border-radius: 999px;
          background: rgba(255,255,255,0.5);
          animation: rwpm-twinkle 3.6s ease-in-out infinite;
        }
        .rwpm-stage {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 190px;
          margin-bottom: 20px;
        }
        .rwpm-paper {
          position: relative;
          width: 168px;
          background: #f4f2ec;
          border-radius: 12px;
          padding: 16px 16px 18px;
          box-shadow: 0 12px 40px rgba(139,92,246,0.25), 0 2px 0 rgba(255,255,255,0.6) inset;
          z-index: 2;
        }
        .rwpm-paper-head {
          height: 10px;
          width: 55%;
          border-radius: 999px;
          background: #1e2235;
          margin-bottom: 12px;
        }
        .rwpm-paper-sub {
          height: 6px;
          width: 38%;
          border-radius: 999px;
          background: #8b5cf6;
          margin-bottom: 12px;
          opacity: 0.8;
        }
        .rwpm-line {
          height: 6px;
          border-radius: 999px;
          background: #c9c9d4;
          margin-bottom: 8px;
          transition: opacity 0.3s ease, background 0.3s ease;
        }
        .rwpm-line:last-child { margin-bottom: 0; }
        .rwpm-line.done { background: #6d6d7d; opacity: 1; }
        .rwpm-line.typing {
          background: #8b5cf6;
          animation: rwpm-typing 1.1s ease-in-out infinite;
        }
        .rwpm-line.todo { opacity: 0.25; }
        .rwpm-cursor {
          display: inline-block;
          width: 2px;
          height: 10px;
          background: #8b5cf6;
          margin-left: 4px;
          vertical-align: middle;
          animation: rwpm-blink 0.8s steps(1) infinite;
        }
        .rwpm-pen-wrap {
          position: absolute;
          right: calc(50% - 108px);
          top: 18px;
          z-index: 3;
          animation: rwpm-write-move 2.2s ease-in-out infinite;
        }
        .rwpm-pen {
          width: 44px;
          height: 44px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 35% 30%, #c4b5fd, #8b5cf6 65%, #6d28d9);
          box-shadow: 0 0 24px rgba(139,92,246,0.65);
        }
        .rwpm-ring {
          position: absolute;
          inset: -6px;
          transform: rotate(-90deg);
        }
        .rwpm-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 16px;
        }
        .rwpm-step { display: flex; align-items: center; gap: 6px; }
        .rwpm-step-label { font: 500 11.5px/1 system-ui, sans-serif; color: rgba(235,235,245,0.6); }
        .rwpm-step-label.done { color: #a78bfa; }
        .rwpm-step-label.active { color: #f4f2ec; }
        .rwpm-bar {
          height: 6px;
          background: rgba(255,255,255,0.08);
          border-radius: 999px;
          overflow: hidden;
          margin-bottom: 14px;
        }
        .rwpm-bar-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #7c3aed, #a78bfa);
          transition: width 0.5s ease;
        }
        .rwpm-percent {
          text-align: center;
          font: 600 12px/1 system-ui, sans-serif;
          color: rgba(216,204,250,0.75);
          letter-spacing: 0.02em;
        }
        .rwpm-headline {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 21px;
          font-weight: 600;
          text-align: center;
          color: #f4f2ec;
          letter-spacing: -0.01em;
          margin: 6px 0;
        }
        .rwpm-message-box {
          position: relative;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 2px;
        }
        .rwpm-message {
          font: 400 13.5px/1.4 system-ui, sans-serif;
          color: rgba(210,212,224,0.72);
          text-align: center;
          animation: rwpm-message-in 0.4s ease both;
        }
        @keyframes rwpm-fadein {
          from { opacity: 0; transform: translateY(14px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes rwpm-typing {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
        @keyframes rwpm-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes rwpm-write-move {
          0%, 100% { transform: translate(0, 0) rotate(-8deg); }
          25% { transform: translate(-6px, 10px) rotate(-8deg); }
          50% { transform: translate(4px, 22px) rotate(-8deg); }
          75% { transform: translate(-4px, 10px) rotate(-8deg); }
        }
        @keyframes rwpm-twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.85; }
        }
        @keyframes rwpm-message-in {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .rwpm-pen-wrap, .rwpm-line.typing, .rwpm-dot, .rwpm-cursor { animation: none !important; }
        }
      `}</style>

      <div className="rwpm-card">
        <div className="rwpm-field">
          {particles.map((p, i) => (
            <span
              key={i}
              className="rwpm-dot"
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

        <div className="rwpm-stage">
          <div className="rwpm-paper">
            <div className="rwpm-paper-head" />
            <div className="rwpm-paper-sub" />
            {lines.map((w, i) => {
              const state =
                i < visibleCount ? "done" : i === visibleCount ? "typing" : "todo";
              return (
                <div
                  key={i}
                  className={`rwpm-line ${state}`}
                  style={{ width: state === "todo" ? `${w}%` : `${w}%` }}
                >
                  {state === "typing" && <span className="rwpm-cursor" />}
                </div>
              );
            })}
          </div>

          <div className="rwpm-pen-wrap">
            <svg className="rwpm-ring" width="56" height="56" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="3" />
              <circle
                cx="28"
                cy="28"
                r={r}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashoffset}
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>
            <div className="rwpm-pen">
              <PenLine size={20} color="#fff" strokeWidth={2} />
            </div>
          </div>
        </div>

        <div className="rwpm-steps">
          {steps.map((step, idx) => {
            const isDone = completedSteps.includes(step.id);
            const isActive = activeStep === idx && !isDone;
            return (
              <div key={step.id} className="rwpm-step">
                {isDone ? (
                  <CheckCircle2 size={14} color="#a78bfa" />
                ) : isActive ? (
                  <Loader2 size={14} color="#f4f2ec" className="animate-spin" />
                ) : (
                  <Circle size={14} color="rgba(255,255,255,0.25)" />
                )}
                <span
                  className={`rwpm-step-label ${isDone ? "done" : isActive ? "active" : ""}`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="rwpm-bar">
          <div className="rwpm-bar-fill" style={{ width: `${percent}%` }} />
        </div>

        <div className="rwpm-percent">{percent}%</div>
        <p className="rwpm-headline">Writing your resume</p>
        <div className="rwpm-message-box">
          <p key={currentMessage} className="rwpm-message">
            {currentMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
