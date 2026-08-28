import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function HistoryDropdown() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div
      className="relative hidden lg:block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        location.pathname === "/scan-history" || location.pathname === "/resume-history" || location.pathname.startsWith("/ats-scan/") || location.pathname.startsWith("/resume-builder/")
          ? "bg-cyan-500/20 text-cyan-600"
          : "text-gray-700 dark:text-gray-100 hover:text-cyan-600"
      }`}>
        History
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 pt-2 w-64 z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 py-2">
            <Link
              to="/scan-history"
              className={`block px-5 py-2.5 text-sm font-medium border-b border-gray-100 dark:border-gray-700 transition-colors hover:bg-cyan-500/20 hover:text-cyan-600 ${
                location.pathname === "/scan-history"
                  ? "bg-cyan-500/20 text-cyan-600"
                  : "text-gray-700 dark:text-gray-300"
              }`}
              onClick={() => setOpen(false)}
            >
              Scan History
            </Link>
            <Link
              to="/resume-history"
              className={`block px-5 py-2.5 text-sm font-medium transition-colors hover:bg-cyan-500/20 hover:text-cyan-600 ${
                location.pathname === "/resume-history"
                  ? "bg-cyan-500/20 text-cyan-600"
                  : "text-gray-700 dark:text-gray-300"
              }`}
              onClick={() => setOpen(false)}
            >
              Resume History
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
