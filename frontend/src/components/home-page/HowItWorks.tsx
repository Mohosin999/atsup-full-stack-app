import { Upload, ClipboardPaste, ScanSearch, Lightbulb } from "lucide-react";
import Wrapper from "../Wrapper";

const steps = [
  {
    icon: Upload,
    number: "01",
    title: "Upload Resume",
    description: "Drag & drop your PDF (max 5MB). We extract text instantly — background pre-parse saves you seconds.",
  },
  {
    icon: ClipboardPaste,
    number: "02",
    title: "Paste Job Description",
    description: "Paste any role — our AI structures the JD into skills, requirements and must-haves.",
  },
  {
    icon: ScanSearch,
    number: "03",
    title: "Get ATS Score",
    description: "Deterministic engine scores 0–100 across 5 categories. Not a black-box LLM number.",
  },
  {
    icon: Lightbulb,
    number: "04",
    title: "Smart Suggestions",
    description: "Up to 8 actionable tips — missing keywords, formatting, measurable results.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 md:py-20 lg:py-24 xl:py-28">
      <Wrapper>
        <div className="text-center mb-10 lg:mb-14">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/20">
            How It Works
          </span>
          <h2 className="mt-4 text-2xl md:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-gray-100">
            From upload to hired-ready in 4 steps
          </h2>
          <p className="mt-3 text-xs md:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            No switching tools. One flow — scan, understand, fix, build.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative bg-white dark:bg-secondary rounded-2xl border border-gray-200 dark:border-gray-800 p-6 xl:p-8 hover:shadow-lg hover:border-cyan-200 dark:hover:border-cyan-500/20 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center mb-4">
                <step.icon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <span className="text-xs font-bold tracking-widest text-cyan-600/40 dark:text-cyan-400/40">
                {step.number}
              </span>
              <h3 className="mt-1 text-base xl:text-lg font-semibold text-gray-900 dark:text-gray-100">
                {step.title}
              </h3>
              <p className="mt-2 text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </Wrapper>
    </section>
  );
}
