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
      className="lg:hidden bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
    >
      <div className="px-4 py-3 space-y-2">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`block px-3 py-2 rounded-lg text-sm font-medium hover:bg-cyan-500/20 ${
              location.pathname === link.path
                ? "bg-cyan-500/20 text-cyan-600"
                : "text-gray-700 dark:text-gray-300"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}

          <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
            <button
              onClick={() => setHistoryOpen(!historyOpen)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-cyan-500/20 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
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
                    className={`block px-3 py-2 rounded-lg text-sm font-medium hover:bg-cyan-500/20 ${
                      location.pathname === "/scan-history"
                        ? "bg-cyan-500/20 text-cyan-600"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Scan History
                  </Link>
                  <Link
                    to="/resume-history"
                    className={`block px-3 py-2 rounded-lg text-sm font-medium hover:bg-cyan-500/20 ${
                      location.pathname === "/resume-history"
                        ? "bg-cyan-500/20 text-cyan-600"
                        : "text-gray-700 dark:text-gray-300"
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

          <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
            <Link
              to="/plans"
              className={`block px-3 py-2 rounded-lg text-sm font-medium hover:bg-cyan-500/20 ${
                location.pathname === "/plans"
                  ? "bg-cyan-500/20 text-cyan-600"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Pricing
          </Link>
          {user && user.role !== "admin" && (() => {
            const getBangladeshCreditDateKey = () => {
              const now = new Date();
              const dhakaMs = now.getTime() + 6 * 60 * 60 * 1000;
              const dhaka = new Date(dhakaMs);
              const hour = dhaka.getUTCHours();
              if (hour < 16) dhaka.setUTCDate(dhaka.getUTCDate() - 1);
              return dhaka.toISOString().slice(0, 10);
            };
            const today = getBangladeshCreditDateKey();
            const credits = user.subscription?.credits ?? 0;
            const lastReset = user.subscription?.lastAiScanResetDate ?? "";
            const effectiveCredits = lastReset !== today ? 3 : credits;
            const exhausted = effectiveCredits < 1;

            return (
              <div className={`px-3 py-2 text-xs font-medium ${
                exhausted
                  ? "text-red-500"
                  : "text-cyan-600 dark:text-cyan-400"
              }`}>
                {exhausted ? "0 credits — New quota at 4 PM BST (Asia/Dhaka, UTC+6)" : `${effectiveCredits}/3 credits`}
              </div>
            );
          })()}
        </div>

      </div>
    </motion.div>
  );
}
