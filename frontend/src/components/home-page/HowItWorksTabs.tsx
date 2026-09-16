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
    badge: "How it works — ATS scan",
    title: "From upload to hired-ready in 4 steps",
    description: "No switching tools. One flow — scan, understand, fix, build.",
    theme: {
      badge: "bg-lime-50 text-stone-800 border-lime-300 dark:bg-lime-400/10 dark:text-lime-200 dark:border-lime-400/20",
      iconBg: "bg-lime-100 dark:bg-lime-400/10",
      iconText: "text-stone-800 dark:text-lime-300",
      numberText: "text-lime-600/50 dark:text-lime-300/40",
      hoverBorder: "hover:border-lime-300 dark:hover:border-lime-400/30",
    },
    steps: [
      {
        icon: Upload,
        number: "01",
        title: "Upload resume",
        description: "Drag and drop your PDF (max 5MB). We extract text instantly — a background pre-parse saves you seconds.",
      },
      {
        icon: ClipboardPaste,
        number: "02",
        title: "Paste job description",
        description: "Paste any role — our AI structures the JD into skills, requirements and must-haves.",
      },
      {
        icon: ScanSearch,
        number: "03",
        title: "Get ATS score",
        description: "A deterministic engine scores 0–100 across 5 categories. Not a black-box LLM number.",
      },
      {
        icon: Lightbulb,
        number: "04",
        title: "Smart suggestions",
        description: "Up to 8 actionable tips — missing keywords, formatting, measurable results.",
      },
    ],
  },
  {
    id: "builder",
    label: "Resume Builder",
    icon: FileText,
    badge: "How it works — resume builder",
    title: "Build an ATS resume in 4 steps",
    description: "No design skills needed. Fill, preview, and export — ATS-ready from the first keystroke.",
    theme: {
      badge: "bg-amber-50 text-stone-800 border-amber-300 dark:bg-amber-400/10 dark:text-amber-200 dark:border-amber-400/20",
      iconBg: "bg-amber-100 dark:bg-amber-400/10",
      iconText: "text-amber-700 dark:text-amber-300",
      numberText: "text-amber-600/50 dark:text-amber-300/40",
      hoverBorder: "hover:border-amber-300 dark:hover:border-amber-400/30",
    },
    steps: [
      {
        icon: UserRound,
        number: "01",
        title: "Fill your details",
        description: "Add personal info, summary, experience, education and skills. Guided forms, no formatting guesswork.",
      },
      {
        icon: LayoutList,
        number: "02",
        title: "Organize sections",
        description: "Drag and drop to reorder, rename any section title — single-column layout stays ATS-perfect.",
      },
      {
        icon: Eye,
        number: "03",
        title: "Live preview and auto-save",
        description: "See the ATS-friendly preview update as you type. Auto-saved every 2s — never lose work.",
      },
      {
        icon: Download,
        number: "04",
        title: "Download ATS PDF",
        description: "One-click export — no tables, images or icons. Validated 100% on Jobscan and Enhancv.",
      },
    ],
  },
  {
    id: "rewrite",
    label: "AI Rewrite",
    icon: Sparkles,
    badge: "How it works — AI rewrite",
    title: "Rewrite for any job in 4 steps",
    description: "Your truth, better framed — tailored to the job without inventing experience.",
    theme: {
      badge: "bg-violet-50 text-stone-800 border-violet-300 dark:bg-violet-400/10 dark:text-violet-200 dark:border-violet-400/20",
      iconBg: "bg-violet-100 dark:bg-violet-400/10",
      iconText: "text-violet-700 dark:text-violet-300",
      numberText: "text-violet-600/50 dark:text-violet-300/40",
      hoverBorder: "hover:border-violet-300 dark:hover:border-violet-400/30",
    },
    steps: [
      {
        icon: Upload,
        number: "01",
        title: "Upload resume",
        description: "Drag and drop your PDF (max 5MB). We extract text instantly — the same parser as the ATS scan.",
      },
      {
        icon: ClipboardPaste,
        number: "02",
        title: "Paste job description",
        description: "Paste any role — AI breaks the JD into skills, requirements and must-haves.",
      },
      {
        icon: Sparkles,
        number: "03",
        title: "AI rewrite",
        description: "Keywords woven naturally into your real experience. Nothing invented — only better wording.",
      },
      {
        icon: Pencil,
        number: "04",
        title: "Review and export",
        description: "Opens directly in the builder — tweak any line, then download an ATS-ready PDF in one click.",
      },
    ],
  },
];

export default function HowItWorksTabs() {
  const [active, setActive] = useState<TabId>("ats");
  const current = tabs.find((t) => t.id === active)!;

  return (
    <section className="font-plex bg-white dark:bg-stone-950 pb-14 md:pb-16 lg:pb-14 xl:pb-16 2xl:pb-20">
      <Wrapper>
        {/* header */}
        <div className="text-center mb-8 lg:mb-10">
          {/* <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white text-stone-700 border border-stone-300 dark:bg-stone-900 dark:text-stone-300 dark:border-stone-700">
            How it works
          </span> */}
          <h2 className="font-fraunces text-2xl md:text-3xl xl:text-4xl font-normal text-stone-900 dark:text-stone-50">
            How it works
          </h2>
          <p className="mt-3 text-xs md:text-base text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            Scan, build, or rewrite — pick your flow. One platform, three ways to get hired.
          </p>
        </div>

        {/* tab switcher */}
        <div className="flex justify-center mb-10 lg:mb-12">
          <div className="inline-flex rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900 p-1 shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === active;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActive(tab.id)}
                  className={`relative flex items-center gap-2 rounded-lg px-3 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-stone-50 dark:text-stone-900"
                      : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="howItWorksTab"
                      className="absolute inset-0 rounded-lg bg-stone-900 dark:bg-lime-300"
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
              <h3 className="font-fraunces mt-3 text-xl md:text-2xl xl:text-3xl font-normal text-stone-900 dark:text-stone-50">
                {current.title}
              </h3>
              <p className="mt-2 text-xs md:text-sm text-stone-600 dark:text-stone-400 max-w-xl mx-auto">
                {current.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
              {current.steps.map((step) => (
                <div
                  key={step.number}
                  className={`relative bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 xl:p-8 transition-colors ${current.theme.hoverBorder}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${current.theme.iconBg}`}>
                    <step.icon className={`w-5 h-5 ${current.theme.iconText}`} />
                  </div>
                  <span className={`text-xs font-bold tracking-widest ${current.theme.numberText}`}>{step.number}</span>
                  <h4 className="mt-1 text-base xl:text-lg font-semibold text-stone-900 dark:text-stone-100">{step.title}</h4>
                  <p className="mt-2 text-xs md:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </Wrapper>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        .font-fraunces { font-family: 'Fraunces', serif; }
        .font-plex { font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>
    </section>
  );
}