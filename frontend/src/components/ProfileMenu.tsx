/* ===================================
Profile Menu Component
=================================== */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, LogOut, FileText, MessageSquare, Star, ChevronRight } from "lucide-react";

interface ProfileMenuProps {
  user: {
    name?: string;
    email: string;
  };
  profileMenuOpen: boolean;
  setProfileMenuOpen: (v: boolean) => void;
  onLogout: () => void;
}

export default function ProfileMenu({
  user,
  profileMenuOpen,
  setProfileMenuOpen,
  onLogout,
}: ProfileMenuProps) {
  const navigate = useNavigate();

  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };
    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuOpen, setProfileMenuOpen]);

  const initials = (user.name || "U")
    .split(" ")
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const menuItems = [
    { icon: Settings, label: "Settings", to: "/settings" },
    { icon: FileText, label: "My Reports", to: "/my-reports" },
  ];

  return (
    <div className="relative" ref={profileMenuRef}>
      <button
        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
        className="flex items-center gap-2 focus:outline-none"
        aria-label="Profile menu"
      >
        <div className="w-9 h-9 rounded-full bg-stone-900 text-lime-300 dark:bg-lime-300 dark:text-stone-900 flex items-center justify-center text-sm font-semibold border-2 border-stone-200 dark:border-stone-700 transition-colors">
          {initials || "U"}
        </div>
      </button>
      <AnimatePresence>
        {profileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-72 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl py-2 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-lime-300 text-lime-300 dark:text-stone-900 flex items-center justify-center text-sm font-semibold">
                  {initials || "U"}
                </div>
                <div className="min-w-0">
                  <p className="font-plex text-sm font-semibold text-stone-900 dark:text-stone-50 truncate">
                    {user.name || "Account"}
                  </p>
                  <p
                    className="font-plex text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5"
                    title={user.email}
                  >
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="pt-1.5 pb-1.5">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setProfileMenuOpen(false);
                    navigate(item.to);
                  }}
                  className="font-plex group flex w-full items-center justify-start gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                >
                  <span className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 flex items-center justify-center shrink-0 transition-colors group-hover:bg-lime-100 group-hover:text-lime-700 dark:group-hover:bg-lime-400/10 dark:group-hover:text-lime-300">
                    <item.icon className="w-3.5 h-3.5" />
                  </span>
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              ))}

              <button
                onClick={() => {
                  setProfileMenuOpen(false);
                  window.dispatchEvent(new Event("open-review-modal"));
                }}
                className="font-plex group flex w-full items-center justify-start gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
              >
                <span className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-400/10 dark:border-amber-400/20 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0 transition-colors group-hover:bg-amber-100 dark:group-hover:bg-amber-400/20">
                  <Star className="w-3.5 h-3.5" />
                </span>
                <span className="flex-1 text-left">Give Review</span>
              </button>

              <button
                onClick={() => {
                  setProfileMenuOpen(false);
                  window.dispatchEvent(new Event("open-report-modal"));
                }}
                className="font-plex group flex w-full items-center justify-start gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
              >
                <span className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 flex items-center justify-center shrink-0 transition-colors group-hover:bg-lime-100 group-hover:text-lime-700 dark:group-hover:bg-lime-400/10 dark:group-hover:text-lime-300">
                  <MessageSquare className="w-3.5 h-3.5" />
                </span>
                <span className="flex-1 text-left">Report a Problem</span>
              </button>
            </div>

            {/* Logout */}
            <div className="border-t border-stone-200 dark:border-stone-800 pt-1.5">
              <button
                onClick={() => {
                  setProfileMenuOpen(false);
                  onLogout();
                }}
                className="font-plex group flex w-full items-center justify-start gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <span className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20 text-red-500 flex items-center justify-center shrink-0 transition-colors group-hover:bg-red-100 dark:group-hover:bg-red-500/20">
                  <LogOut className="w-3.5 h-3.5" />
                </span>
                <span className="flex-1 text-left font-medium">Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}