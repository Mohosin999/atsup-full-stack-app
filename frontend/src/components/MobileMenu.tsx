/* ===================================
Mobile Menu Component
=================================== */
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface NavLink {
  path: string;
  label: string;
}

export default function MobileMenu({ navLinks, user, setMobileMenuOpen }: { navLinks: NavLink[]; user: any; setMobileMenuOpen: (v: boolean) => void }) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const location = useLocation();

  const historyOptions = [
    { title: "ATS Score History", path: "/ats-score-history" },
    { title: "Resume Build History", path: "/resume-build-history" },
  ];

  const isHistoryActive = historyOptions.some(opt => location.pathname === opt.path);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="md:hidden bg-gray-900 border-t border-gray-800"
    >
      <div className="px-4 py-3 space-y-2">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`block px-3 py-2 rounded-lg text-sm font-medium ${
              location.pathname === link.path
                ? "bg-green-500/20 text-green-400"
                : "text-gray-300"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}

        <button
          onClick={() => setHistoryOpen(!historyOpen)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
            isHistoryActive
              ? "bg-green-500/20 text-green-400"
              : "text-gray-300"
          }`}
        >
          <span>History</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${historyOpen ? "rotate-180" : ""}`} />
        </button>

        {historyOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="pl-4 space-y-1"
          >
            {historyOptions.map((option) => (
              <Link
                key={option.path}
                to={option.path}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === option.path
                    ? "bg-green-500/20 text-green-400"
                    : "text-gray-400"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {option.title}
              </Link>
            ))}
          </motion.div>
        )}

        <Link to="/plans" className="block px-3 py-2 rounded-lg text-sm font-medium text-orange-400" onClick={() => setMobileMenuOpen(false)}>
          Upgrade Plan
        </Link>
        <div className="px-3 py-2 text-sm text-gray-400">{user.subscription.credits} credits</div>
        
        <div className="border-t border-gray-700 mt-2 pt-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 flex items-center justify-center text-white text-sm font-medium">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <Link to="/settings" className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
            Settings
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
