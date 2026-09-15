import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  ClipboardPaste,
  ScanSearch,
  Lightbulb,
  UserRound,
  LayoutList,
  Eye,
  Download,
  Sparkles,
  Pencil,
  FileText,
} from "lucide-react";
import Wrapper from "../Wrapper";

type TabId = "ats" | "builder" | "rewrite";

interface Step {
  icon: React.ElementType;
  number: string;
  title: string;
  description: string;
}

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ElementType;
  badge: string;
  title: string;
  description: string;
  theme: {
    badge: string;
    iconBg: string;
    iconText: string;
    numberText: string;
    hoverBorder: string;
  };
  steps: Step[];
}

const tabs: TabConfig[] = [
  {
    id: "ats",
    label: "ATS Score Check",
    icon: ScanSearch,
    badge: "How It Works — ATS Scan",
    title: "From upload to hired-ready in 4 steps",
    description: "No switching tools. One flow — scan, understand, fix, build.",
    theme: {
      badge: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/20",
      iconBg: "bg-cyan-50 dark:bg-cyan-500/10",
      iconText: "text-cyan-600 dark:text-cyan-400",
      numberText: "text-cyan-600/40 dark:text-cyan-400/40",
      hoverBorder: "hover:border-cyan-200 dark:hover:border-cyan-500/20",
    },
    steps: [
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
    ],
  },
  {
    id: "builder",
    label: "Resume Builder",
    icon: FileText,
    badge: "How It Works — Resume Builder",
    title: "Build an ATS resume in 4 steps",
    description: "No design skills needed. Fill, preview, and export — ATS-ready from the first keystroke.",
    theme: {
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      iconText: "text-emerald-600 dark:text-emerald-400",
      numberText: "text-emerald-600/40 dark:text-emerald-400/40",
      hoverBorder: "hover:border-emerald-200 dark:hover:border-emerald-500/20",
    },
    steps: [
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
    ],
  },
  {
    id: "rewrite",
    label: "AI Rewrite",
    icon: Sparkles,
    badge: "How It Works — AI Rewrite",
    title: "Rewrite for any job in 4 steps",
    description: "Your truth, better framed — tailored to the job without inventing experience.",
    theme: {
      badge: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20",
      iconBg: "bg-violet-50 dark:bg-violet-500/10",
      iconText: "text-violet-600 dark:text-violet-400",
      numberText: "text-violet-600/40 dark:text-violet-400/40",
      hoverBorder: "hover:border-violet-200 dark:hover:border-violet-500/20",
    },
    steps: [
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
    ],
  },
];

export default function HowItWorksTabs() {
  const [active, setActive] = useState<TabId>("ats");
  const current = tabs.find((t) => t.id === active)!;

  return (
    <section className="py-16 md:py-20 lg:py-24 xl:py-28">
      <Wrapper>
        {/* header */}
        <div className="text-center mb-8 lg:mb-10">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/20">
            How It Works
          </span>
          <h2 className="mt-4 text-2xl md:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Everything you need to get hired
          </h2>
          <p className="mt-3 text-xs md:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Scan, build, or rewrite — pick your flow. One platform, three ways to get hired.
          </p>
        </div>

        {/* tab switcher - like FeatureShowcase */}
        <div className="flex justify-center mb-10 lg:mb-12">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 p-1 shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === active;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActive(tab.id)}
                  className={`relative flex items-center gap-2 rounded-lg px-3 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-white dark:text-slate-800"
                      : "text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="howItWorksTab"
                      className="absolute inset-0 rounded-lg bg-slate-800 dark:bg-slate-100"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5 md:gap-2">
                    <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <div className="text-center mb-8">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${current.theme.badge}`}
              >
                {current.badge}
              </span>
              <h3 className="mt-3 text-xl md:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {current.title}
              </h3>
              <p className="mt-2 text-xs md:text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                {current.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
              {current.steps.map((step) => (
                <div
                  key={step.number}
                  className={`relative bg-white dark:bg-secondary rounded-2xl border border-gray-200 dark:border-gray-800 p-6 xl:p-8 hover:shadow-lg transition-all ${current.theme.hoverBorder}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${current.theme.iconBg}`}>
                    <step.icon className={`w-5 h-5 ${current.theme.iconText}`} />
                  </div>
                  <span className={`text-xs font-bold tracking-widest ${current.theme.numberText}`}>{step.number}</span>
                  <h4 className="mt-1 text-base xl:text-lg font-semibold text-gray-900 dark:text-gray-100">{step.title}</h4>
                  <p className="mt-2 text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </Wrapper>
    </section>
  );
}
