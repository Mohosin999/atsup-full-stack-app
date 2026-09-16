import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FilePlus2, UploadCloud, ArrowRight, Sparkles, Check, GripVertical, Eye } from "lucide-react";
import { goToLogin } from "../utils/authGuard";
import { useAppSelector } from "@/hooks";
import Wrapper from "../components/Wrapper";

export default function ResumeDashboard() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  return (
    // <div className="min-h-screen bg-stone-50 dark:bg-stone-950 lg:pt-24 pb-12">
    <div className="min-h-screen bg-white dark:bg-stone-950">
      {/* Hero — same language as homepage HeroSection */}
      {/* <section className="relative overflow-hidden pt-8 lg:pt-0 pb-10 md:pb-12 lg:pb-16"> */}
      <section className="relative overflow-hidden pt-8 lg:pt-32 pb-10 md:pb-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-40 dark:hidden"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(28,25,23,0.35) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 hidden dark:block opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(250,250,249,0.5) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <Wrapper className="relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* <span className="font-plex inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-400/10 dark:text-amber-200 dark:border-amber-400/20">
              <Sparkles className="w-3.5 h-3.5" />
              ATS resume builder
            </span> */}

            <h1 className="font-fraunces text-2xl md:text-3xl font-normal leading-[1.08] text-stone-900 dark:text-stone-50">
              How would you like to{" "}
              <span className="relative inline-block whitespace-nowrap">
                <span className="relative z-10">start?</span>
                <span className="absolute left-0 right-0 bottom-[0.08em] h-[0.32em] bg-lime-300/80 dark:bg-lime-400/70 rounded-[2px] -z-0" />
              </span>
            </h1>

            <p className="font-plex mt-4 text-sm md:text-base leading-relaxed text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              Start with our best ATS-optimized template — single-column, no tables or images,
              validated 100% on Jobscan and Enhancv. Drag to reorder, edit any section title,
              auto-saved every 2s.
            </p>

            {/* <div className="font-plex mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs md:text-sm text-stone-500 dark:text-stone-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Auto-saved every 2s
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Unlimited saves
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                PDF in one click
              </span>
            </div> */}
          </motion.div>
        </Wrapper>
      </section>

      {/* Cards — two options */}
      <Wrapper className="relative pb-16 lg:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {/* Create new */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-plex group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 box-shadow"
          >
            <div className="h-1.5 bg-amber-400 dark:bg-amber-300" />
            <div className="p-6 md:p-7 lg:p-8 flex flex-col flex-1">
              <div className="w-11 h-11 rounded-xl bg-stone-900 dark:bg-lime-300 text-white dark:text-stone-900 flex items-center justify-center">
                <FilePlus2 className="w-5 h-5" />
              </div>

              <h3 className="font-fraunces mt-4 text-xl font-normal text-stone-900 dark:text-stone-50">
                Create a new resume
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400 flex-1">
                Start from scratch with our ATS-friendly template. Every section is movable and
                editable — drag to reorder, rename titles, preview live as you type.
              </p>

              {/* mini preview hint — homepage BuilderPreview language */}
              {/* <div className="mt-5 space-y-1.5">
                {["Profile Info", "Summary", "Experience"].map((s) => (
                  <div
                    key={s}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/40 text-xs font-medium text-stone-600 dark:text-stone-400"
                  >
                    <GripVertical className="w-3.5 h-3.5 text-stone-400" />
                    {s}
                    <Eye className="w-3 h-3 text-stone-400 ml-auto" />
                  </div>
                ))}
                <p className="text-[11px] text-stone-500 dark:text-stone-400">+ Skills, Education, Projects…</p>
              </div> */}

              <ul className="mt-5 space-y-2 text-xs text-stone-600 dark:text-stone-400">
                {["Live preview as you type", "Auto-save every 2s — never lose work"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-400/10 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-amber-700 dark:text-amber-300" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>

              <button
                onClick={() =>
                  user ? navigate("/resume-builder/new") : goToLogin(navigate, "/resume-builder")
                }
                className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-stone-900 dark:bg-lime-300 text-stone-50 dark:text-stone-900 text-sm font-semibold hover:bg-stone-800 dark:hover:bg-lime-200 transition-colors"
              >
                <FilePlus2 className="w-4 h-4" />
                Create resume
                <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Upload & rewrite — live */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-plex group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 box-shadow"
          >
            <div className="h-1.5 bg-violet-500 dark:bg-violet-400" />
            <div className="p-6 md:p-7 lg:p-8 flex flex-col flex-1">
              <div className="w-11 h-11 rounded-xl bg-violet-600 dark:bg-violet-500 text-white flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>

              <h3 className="font-fraunces mt-4 text-xl font-normal text-stone-900 dark:text-stone-50">
                Upload & rewrite with AI
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400 flex-1">
                Upload your PDF resume and paste a job description — AI rewrites it to match the
                role while keeping your experience 100% truthful.
              </p>

              {/* steps hint — mirrors /resume-builder/upload */}
              {/* <div className="mt-5 flex items-center gap-1.5 text-xs font-medium">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-600 text-white">
                  1 Upload
                </span>
                <span className="w-4 h-px bg-stone-300 dark:bg-stone-700" />
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300">
                  2 Job details
                </span>
                <span className="w-4 h-px bg-stone-300 dark:bg-stone-700" />
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300">
                  3 Rewrite
                </span>
              </div> */}

              <ul className="mt-5 space-y-2 text-xs text-stone-600 dark:text-stone-400">
                {["Tailored keywords from the JD", "Truthful — nothing invented", "Opens in builder to edit & download"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-violet-600 dark:text-violet-300" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>

              <button
                onClick={() =>
                  user ? navigate("/resume-builder/upload") : goToLogin(navigate, "/resume-builder/upload")
                }
                className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors"
              >
                <UploadCloud className="w-4 h-4" />
                Upload resume
                <ArrowRight className="w-4 h-4 opacity-80 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* footnote */}
        {/* <p className="font-plex mt-8 text-center text-xs text-stone-500 dark:text-stone-400">
          No credit needed to build — sign in to save. Exports are PDF only, single-column.
        </p> */}
      </Wrapper>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        .font-fraunces { font-family: 'Fraunces', serif; }
        .font-plex { font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>
    </div>
  );
}
