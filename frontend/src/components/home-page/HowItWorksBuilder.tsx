import { UserRound, LayoutList, Eye, Download } from "lucide-react";
import Wrapper from "../Wrapper";

const steps = [
  {
    icon: UserRound,
    number: "01",
    title: "Fill Your Details",
    description: "Add personal info, summary, experience, education & skills. Guided forms, no formatting guesswork.",
  },
  {
    icon: LayoutList,
    number: "02",
    title: "Organize Sections",
    description: "Drag & drop to reorder, rename any section title — single-column layout stays ATS-perfect.",
  },
  {
    icon: Eye,
    number: "03",
    title: "Live Preview & Auto-Save",
    description: "See ATS-friendly preview update as you type. Auto-saved every 2s — never lose work.",
  },
  {
    icon: Download,
    number: "04",
    title: "Download ATS PDF",
    description: "One-click export — no tables, images or icons. Validated 100% on Jobscan & Enhancv.",
  },
];

export default function HowItWorksBuilder() {
  return (
    <section className="py-16 md:py-20 lg:py-24 xl:py-28 bg-gray-50 dark:bg-secondary/20 border-y border-gray-100 dark:border-gray-800">
      <Wrapper>
        <div className="text-center mb-10 lg:mb-14">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20">
            How It Works — Resume Builder
          </span>
          <h2 className="mt-4 text-2xl md:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Build an ATS resume in 4 steps
          </h2>
          <p className="mt-3 text-xs md:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            No design skills needed. Fill, preview, and export — ATS-ready from the first keystroke.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative bg-white dark:bg-secondary rounded-2xl border border-gray-200 dark:border-gray-800 p-6 xl:p-8 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-500/20 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-4">
                <step.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-bold tracking-widest text-emerald-600/40 dark:text-emerald-400/40">
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
