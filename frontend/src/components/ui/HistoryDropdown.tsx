/* ===================================
History Dropdown Component
=================================== */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, FileSearch } from "lucide-react";

export default function HistoryDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const historyOptions = [
    {
      title: "ATS Score History",
      description: "View all your past ATS score analyses",
      icon: FileSearch,
      path: "/ats-score-history",
      gradient: "from-purple-500 to-blue-500",
      bgLight: "hover:bg-purple-500/20",
      activePath: "/ats-score-history",
    },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div
      className="relative"
      ref={dropdownRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors"
      >
        <span className="hidden md:inline">History</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-xl border border-gray-200 shadow-2xl overflow-hidden z-50"
          >
            <div className="p-2">
              {historyOptions.map((option) => {
                const isActive = location.pathname === option.activePath;
                return (
                  <button
                    key={option.path}
                    onClick={() => handleNavigate(option.path)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${option.bgLight} ${
                      isActive ? "bg-gray-100" : ""
                    }`}
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${option.gradient}`}>
                      <option.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{option.title}</h4>
                      <p className="text-xs text-gray-600">{option.description}</p>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
