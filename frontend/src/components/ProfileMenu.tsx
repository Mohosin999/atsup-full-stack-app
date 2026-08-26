/* ===================================
Profile Menu Component
=================================== */
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, LogOut, FileText, MessageSquare } from "lucide-react";

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

  return (
    <div className="relative" ref={profileMenuRef}>
      <button
        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
        className="flex items-center gap-2"
      >
        <div className="w-9 h-9 rounded-full bg-cyan-600 flex items-center justify-center text-white font-medium">
          {user.name?.charAt(0).toUpperCase() || "U"}
        </div>
      </button>
      <AnimatePresence>
        {profileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
          >
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {user.name}
              </p>
              <p
                className="text-xs text-gray-600 truncate mt-1"
                title={user.email}
              >
                {user.email}
              </p>
            </div>
            <Link
              to="/settings"
              className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setProfileMenuOpen(false)}
            >
              <Settings className="w-4 h-4" /> <span>Settings</span>
            </Link>
            <Link
              to="/my-reports"
              className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setProfileMenuOpen(false)}
            >
              <FileText className="w-4 h-4" /> <span>My Reports</span>
            </Link>
            <button
              onClick={() => {
                setProfileMenuOpen(false);
                window.dispatchEvent(new Event("open-report-modal"));
              }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <MessageSquare className="w-4 h-4" /> <span>Report a Problem</span>
            </button>
            <button
              onClick={() => {
                setProfileMenuOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" /> <span>Logout</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
