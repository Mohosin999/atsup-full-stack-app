import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanSearch, FileText } from "lucide-react";
import Wrapper from "../Wrapper";

const tabs = [
  {
    id: "scan" as const,
    label: "ATS Scan",
    icon: ScanSearch,
    image: "/scan.png",
  },
  {
    id: "builder" as const,
    label: "Resume Builder",
    icon: FileText,
    image: "/builder.png",
  },
] as const;

export default function FeatureShowcase() {
  const [active, setActive] = useState<"scan" | "builder">("scan");
  const current = tabs.find((t) => t.id === active)!;

  return (
    <section className="pb-20 lg:pb-20 xl:pb-28">
      <Wrapper>
        {/* heading */}
        <div className="text-center mb-3 lg:mb-6">
            <h2 className="text-2xl xl:text-3xl font-medium tracking-tight text-slate-800 dark:text-slate-100">
            Everything you need to{" "}
            <span className="underline decoration-slate-300 dark:decoration-slate-500 decoration-[3px] underline-offset-4">
              get hired
            </span>
          </h2>
            <p className="mt-3 text-sm lg:text-base text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
            Two powerful tools — one platform. Pick what you need right now.
          </p>
        </div>

        {/* tab switcher */}
        <div className="flex justify-center mb-6 lg:mb-8">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 p-1 shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === active;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActive(tab.id)}
                  className={`
                    relative flex items-center gap-2 rounded-lg px-4 md:px-5 py-2 md:py-2.5 text-[13px] md:text-sm font-semibold transition-colors duration-200
                    ${isActive ? "text-white dark:text-slate-800" : "text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100"}
                  `}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-lg bg-slate-800 dark:bg-slate-100"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* image reveal */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative rounded-xl overflow-hidden bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700"
          >
            <img
              src={current.image}
              alt={current.label}
              className="w-full h-auto object-cover object-top"
            />
          </motion.div>
        </AnimatePresence>
      </Wrapper>
    </section>
  );
}
