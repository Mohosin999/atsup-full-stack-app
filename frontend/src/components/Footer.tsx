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
          <div className="flex-1 h-px bg-gray-400"></div>

          <span className="text-sm italic text-gray-600 whitespace-nowrap">
            Built to pass every ATS
          </span>

          <div className="flex-1 h-px bg-gray-400"></div>
        </div>

        {/* Main Footer Row */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-sm">
          {/* Left: Logo */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <img src="/favicon.png" alt="ATSUp" className="w-8 h-6" />
            <span className="text-lg font-bold text-gray-800">
              ATS<span className="text-cyan-500">Up</span>
            </span>
          </div>

          {/* Center Links */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-gray-800">
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
                className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
              >
                <LogOut size={14} />
                Logout
              </button>
            )}
          </div>
        </div>

        {/* Bottom: Copyright */}
        <p className="text-center text-xs text-gray-600 mt-8">
          © 2026 ATSUp. All Rights Reserved.
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
