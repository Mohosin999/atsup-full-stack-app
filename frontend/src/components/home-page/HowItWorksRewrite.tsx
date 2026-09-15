import { Upload, ClipboardPaste, Sparkles, Pencil } from "lucide-react";
import Wrapper from "../Wrapper";

const steps = [
  {
    icon: Upload,
    number: "01",
    title: "Upload Resume",
    description: "Drag & drop your PDF (max 5MB). We extract text instantly — same parser as ATS scan.",
  },
  {
    icon: ClipboardPaste,
    number: "02",
    title: "Paste Job Description",
    description: "Paste any role — AI breaks the JD into skills, requirements and must-haves.",
  },
  {
    icon: Sparkles,
    number: "03",
    title: "AI Rewrite",
    description: "Keywords woven naturally into your real experience. Nothing invented — only better wording.",
  },
  {
    icon: Pencil,
    number: "04",
    title: "Review & Export",
    description: "Opens directly in builder — tweak any line, then download ATS-ready PDF in one click.",
  },
];

export default function HowItWorksRewrite() {
  return (
    <section className="py-16 md:py-20 lg:py-24 xl:py-28">
      <Wrapper>
        <div className="text-center mb-10 lg:mb-14">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20">
            How It Works — AI Rewrite
          </span>
          <h2 className="mt-4 text-2xl md:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Rewrite for any job in 4 steps
          </h2>
          <p className="mt-3 text-xs md:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your truth, better framed — tailored to the job without inventing experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative bg-white dark:bg-secondary rounded-2xl border border-gray-200 dark:border-gray-800 p-6 xl:p-8 hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-500/20 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center mb-4">
                <step.icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-xs font-bold tracking-widest text-violet-600/40 dark:text-violet-400/40">
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
