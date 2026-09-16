import { useState } from "react";
import { motion } from "framer-motion";
import { ScanSearch, FileText } from "lucide-react";
import Wrapper from "../Wrapper";

const tabs = [
  {
    id: "scan" as const,
    label: "ATS Scan",
    short: "Scan",
    icon: ScanSearch,
    light: "/scan.png",
    dark: "/scanDark.png",
  },
  {
    id: "build" as const,
    label: "Resume Builder",
    short: "Build",
    icon: FileText,
    light: "/builder.png",
    dark: "/builderDark.png",
  },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function FeatureShowcase() {
  const [active, setActive] = useState<TabId>("scan");
  const current = tabs.find((t) => t.id === active)!;

  return (
    <section className="font-plex bg-white dark:bg-stone-950 pb-14 md:pb-16 lg:pb-14 xl:pb-16 2xl:pb-20">
      <Wrapper>
        {/* heading */}
        <div className="text-center mb-3 lg:mb-6">
          <h2 className="font-fraunces text-2xl md:text-3xl xl:text-4xl font-normal tracking-tight text-stone-900 dark:text-stone-50">
            Everything you need to{" "}
            <span className="relative inline-block whitespace-nowrap">
              <span className="relative z-10">get hired</span>
              <span className="absolute left-0 right-0 bottom-[0.06em] h-[0.28em] bg-lime-300/80 dark:bg-lime-400/70 rounded-[2px] -z-0" />
            </span>
          </h2>
          <p className="mt-3 text-sm lg:text-base text-stone-600 dark:text-stone-400 max-w-lg mx-auto">
            Two powerful tools — one platform. Pick what you need right now.
          </p>
        </div>

        {/* tab switcher */}
        <div className="flex justify-center mb-6 lg:mb-8">
          <div className="inline-flex rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900 p-1 shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === active;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActive(tab.id)}
                  className={`
                    relative flex items-center gap-2 rounded-lg px-4 md:px-5 py-2 md:py-2.5 text-[13px] md:text-sm font-semibold transition-colors
                    ${isActive ? "text-stone-50 dark:text-stone-900" : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"}
                  `}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-lg bg-stone-900 dark:bg-lime-300"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.short}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* image reveal — no animation, instant switch; light/dark variants */}
        <div className="relative rounded-xl overflow-hidden bg-white border border-stone-200 dark:bg-stone-900 dark:border-stone-800">
          <img
            src={current.light}
            alt={current.label}
            className="w-full h-auto object-cover object-top dark:hidden"
          />
          <img
            src={current.dark}
            alt={current.label}
            className="w-full h-auto object-cover object-top hidden dark:block"
          />
        </div>
      </Wrapper>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        .font-fraunces { font-family: 'Fraunces', serif; }
        .font-plex { font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>
    </section>
  );
}
