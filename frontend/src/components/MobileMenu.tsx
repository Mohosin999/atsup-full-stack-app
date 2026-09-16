/* ===================================
Mobile Menu Component
=================================== */
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Clock, ChevronDown } from "lucide-react";

interface NavLink {
  path: string;
  label: string;
}

export default function MobileMenu({ navLinks, user, setMobileMenuOpen }: { navLinks: NavLink[]; user: any; setMobileMenuOpen: (v: boolean) => void }) {
  const location = useLocation();
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="lg:hidden bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800"
    >
      <div className="px-4 py-3 space-y-2">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`block px-3 py-2 rounded-lg text-sm font-medium hover:bg-lime-100 dark:hover:bg-lime-400/10 ${
              location.pathname === link.path
                ? "bg-lime-100 text-stone-900 dark:bg-lime-400/10 dark:text-lime-200"
                : "text-stone-700 dark:text-stone-300"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}

          <div className="border-t border-stone-200 dark:border-stone-800 mt-2 pt-2">
            <button
              onClick={() => setHistoryOpen(!historyOpen)}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-lime-100 dark:hover:bg-lime-400/10 ${
                location.pathname === "/scan-history" || location.pathname === "/resume-history"
                  ? "bg-lime-100 text-stone-900 dark:bg-lime-400/10 dark:text-lime-200"
                  : "text-stone-700 dark:text-stone-300"
              }`}
          >
            <Clock className="w-4 h-4" />
            History
            <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${historyOpen ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {historyOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pl-6 space-y-1 py-1">
                  <Link
                    to="/scan-history"
                    className={`block px-3 py-2 rounded-lg text-sm font-medium hover:bg-lime-100 dark:hover:bg-lime-400/10 ${
                      location.pathname === "/scan-history"
                        ? "bg-lime-100 text-stone-900 dark:bg-lime-400/10 dark:text-lime-200"
                        : "text-stone-700 dark:text-stone-300"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Scan History
                  </Link>
                  <Link
                    to="/resume-history"
                    className={`block px-3 py-2 rounded-lg text-sm font-medium hover:bg-lime-100 dark:hover:bg-lime-400/10 ${
                      location.pathname === "/resume-history"
                        ? "bg-lime-100 text-stone-900 dark:bg-lime-400/10 dark:text-lime-200"
                        : "text-stone-700 dark:text-stone-300"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Resume History
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

          <div className="border-t border-stone-200 dark:border-stone-800 mt-2 pt-2">
            <Link
              to="/plans"
              className={`block px-3 py-2 rounded-lg text-sm font-medium hover:bg-lime-100 dark:hover:bg-lime-400/10 ${
                location.pathname === "/plans"
                  ? "bg-lime-100 text-stone-900 dark:bg-lime-400/10 dark:text-lime-200"
                  : "text-stone-700 dark:text-stone-300"
              }`}
            onClick={() => setMobileMenuOpen(false)}
            >
            Pricing
          </Link>
        </div>

      </div>
    </motion.div>
  );
}
