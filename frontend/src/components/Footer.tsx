
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { logoutUser } from "../store/slices/authSlice";
import ConfirmModal from "./ui/ConfirmModal";
import Wrapper from "./Wrapper";

const socialLinks = [
  { name: "GitHub", url: "#" },
  { name: "LinkedIn", url: "#" },
  { name: "Twitter", url: "#" },
  { name: "mohosin.hasan.akash@gmail.com", url: "mailto:mohosin.hasan.akash@gmail.com" },
];

const Footer = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await dispatch(logoutUser());
    navigate("/");
  };

  return (
    <footer className="font-plex py-8 bg-white dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800">
      <Wrapper className="!px-4 lg:!px-16">
        {/* Top Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
          <span className="font-fraunces italic text-sm text-stone-500 dark:text-stone-400 whitespace-nowrap">
            Built to pass every ATS
          </span>
          <div className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
        </div>

        {/* Main Footer Row */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-sm">
          {/* Left: Logo */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <img src="/favicon.png" alt="CVScan" className="w-8 h-6" />
            <span className="font-fraunces text-lg font-medium text-stone-900 dark:text-stone-50">
              CV
              <span className="relative inline-block">
                <span className="relative z-10">Scan</span>
                <span className="absolute left-0 right-0 bottom-[0.1em] h-[0.28em] bg-lime-300/80 dark:bg-lime-400/70 rounded-[2px] -z-0" />
              </span>
            </span>
          </div>

          {/* Center Links */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-stone-700 dark:text-stone-300">
            {socialLinks.map((link, i) => (
              <span key={link.name} className="flex items-center gap-2">
                {i > 0 && <span className="text-stone-300 dark:text-stone-700">•</span>}
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-stone-900 dark:hover:text-stone-50 hover:underline underline-offset-4 transition-colors"
                >
                  {link.name}
                </a>
              </span>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3 whitespace-nowrap">
            {user && (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut size={14} />
                Logout
              </button>
            )}
          </div>
        </div>

        {/* Bottom: Copyright */}
        <p className="text-center text-xs text-stone-400 dark:text-stone-500 mt-8">
          © 2026 CVScan. All rights reserved.
        </p>
      </Wrapper>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        type="danger"
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        .font-fraunces { font-family: 'Fraunces', serif; }
        .font-plex { font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>
    </footer>
  );
};

export default Footer;