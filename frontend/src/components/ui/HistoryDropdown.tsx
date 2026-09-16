import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ScanSearch, FileText } from "lucide-react";

export default function HistoryDropdown() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const onHistory =
    location.pathname === "/scan-history" || location.pathname === "/resume-history";

  return (
    <div
      className="relative hidden lg:block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className={`font-plex flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm xl:text-[15px] font-medium transition-colors ${
          onHistory
            ? "bg-lime-100 text-stone-900 dark:bg-lime-400/10 dark:text-lime-200"
            : "text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-50"
        }`}
      >
        History
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full right-0 pt-2 w-72 z-50"
          >
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                <span className="font-plex text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  Your history
                </span>
              </div>

              <Link
                to="/scan-history"
                className={`group flex items-center gap-3 px-4 py-3 transition-colors ${
                  location.pathname === "/scan-history"
                    ? "bg-amber-50 dark:bg-amber-400/5"
                    : "hover:bg-stone-50 dark:hover:bg-stone-800/60"
                }`}
                onClick={() => setOpen(false)}
              >
                <span
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                    location.pathname === "/scan-history"
                      ? "bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-400/10 dark:border-amber-400/20 dark:text-amber-300"
                      : "bg-stone-100 border-stone-200 text-stone-500 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400"
                  }`}
                >
                  <ScanSearch className="w-4 h-4" />
                </span>
                <span className="min-w-0">
                  <span
                    className={`font-plex block text-sm font-medium ${
                      location.pathname === "/scan-history"
                        ? "text-amber-800 dark:text-amber-200"
                        : "text-stone-800 dark:text-stone-100"
                    }`}
                  >
                    Scan History
                  </span>
                  <span className="font-plex block text-xs mt-0.5 text-stone-500 dark:text-stone-400 truncate">
                    ATS scores & keyword analysis
                  </span>
                </span>
              </Link>

              <Link
                to="/resume-history"
                className={`group flex items-center gap-3 px-4 py-3 transition-colors border-t border-stone-100 dark:border-stone-800 ${
                  location.pathname === "/resume-history"
                    ? "bg-lime-50 dark:bg-lime-400/5"
                    : "hover:bg-stone-50 dark:hover:bg-stone-800/60"
                }`}
                onClick={() => setOpen(false)}
              >
                <span
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                    location.pathname === "/resume-history"
                      ? "bg-lime-100 border-lime-200 text-lime-700 dark:bg-lime-400/10 dark:border-lime-400/20 dark:text-lime-300"
                      : "bg-stone-100 border-stone-200 text-stone-500 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                </span>
                <span className="min-w-0">
                  <span
                    className={`font-plex block text-sm font-medium ${
                      location.pathname === "/resume-history"
                        ? "text-lime-800 dark:text-lime-200"
                        : "text-stone-800 dark:text-stone-100"
                    }`}
                  >
                    Resume History
                  </span>
                  <span className="font-plex block text-xs mt-0.5 text-stone-500 dark:text-stone-400 truncate">
                    Builder drafts & versions
                  </span>
                </span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        .font-plex { font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>
    </div>
  );
}