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
    <footer className="py-8">
      <Wrapper className="!px-4 lg:!px-16">
        {/* Top Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gray-400 dark:bg-gray-600"></div>

          <span className="text-sm italic text-gray-600 whitespace-nowrap dark:text-gray-400">
            Built to pass every ATS
          </span>

          <div className="flex-1 h-px bg-gray-400 dark:bg-gray-600"></div>
        </div>

        {/* Main Footer Row */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-sm">
          {/* Left: Logo */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <img src="/favicon.png" alt="CVScan" className="w-8 h-6" />
            <span className="text-lg font-bold text-gray-800 dark:text-gray-100">
              CV<span className="text-cyan-500">Scan</span>
            </span>
          </div>

          {/* Center Links */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-gray-800 dark:text-gray-100">
            {socialLinks.map((link, i) => (
              <span key={link.name} className="flex items-center gap-2">
                {i > 0 && <span>•</span>}
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
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
                className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 dark:text-red-100 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-700 rounded-lg"
              >
                <LogOut size={14} />
                Logout
              </button>
            )}
          </div>
        </div>

        {/* Bottom: Copyright */}
        <p className="text-center text-xs text-gray-600 dark:text-gray-400 mt-8">
          © 2026 CVScan. All Rights Reserved.
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
    </footer>
  );
};

export default Footer;
