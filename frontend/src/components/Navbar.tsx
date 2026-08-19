import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu } from "lucide-react";
import { useState } from "react";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { logoutUser } from "../store/slices/authSlice";
import ConfirmModal from "./ui/ConfirmModal";
import NavLinks from "./NavLinks";
import ProfileMenu from "./ProfileMenu";
import MobileMenuButton from "./MobileMenuButton";
import MobileMenu from "./MobileMenu";
import AuthButtons from "./ui/AuthButtons";
import Wrapper from "./Wrapper";

interface NavLink {
  path: string;
  label: string;
}

const getNavLinks = (role?: string): NavLink[] => [
  ...(role
    ? [
        {
          path: role === "admin" ? "/admin-dashboard" : "/dashboard",
          label: "Dashboard",
        },
      ]
    : []),
    { path: "/ats-scan", label: "ATS Scan" },
  { path: "/resume-builder", label: "Resume Builder" },
];

export default function Navbar() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await dispatch(logoutUser());
    navigate("/");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 py-1 bg-white/80 backdrop-blur-md box-shadow">
        <Wrapper>
          <div className="flex items-center justify-between h-14">
            {/* Logo with app name */}
            <Link to="/" className="flex items-center gap-2 font-mono">
              <img src="/favicon.png" alt="CVCoach" className="w-10 h-8" />
              <span className="text-xl font-bold text-gray-900">
                ATS<span className="text-cyan-500">Up</span>
              </span>
            </Link>

            <div className="flex items-center gap-4">
              {/* Navigation links for large screens */}
              <NavLinks navLinks={getNavLinks(user?.role)} />

              {user ? (
                <>
                  <ProfileMenu
                    user={user}
                    profileMenuOpen={profileMenuOpen}
                    setProfileMenuOpen={setProfileMenuOpen}
                    onLogout={() => setShowLogoutConfirm(true)}
                  />
                  
                  {/* Mobile menu button (only visible on small screens) */}
                  <MobileMenuButton
                    mobileMenuOpen={mobileMenuOpen}
                    setMobileMenuOpen={setMobileMenuOpen}
                  />
                </>
              ) : (
                <>
                  <div className="hidden md:flex items-center gap-4">
                    <AuthButtons />
                  </div>
                  {/* <button
                    className="md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    {mobileMenuOpen ? (
                      <X className="w-6 h-6 text-gray-900" />
                    ) : (
                      <Menu className="w-6 h-6 text-gray-900" />
                    )}
                  </button> */}
                </>
              )}
            </div>
          </div>
        </Wrapper>
        
        {/* =============================================================
         * Mobile menus when click on three dots
         ==============================================================*/}
        <AnimatePresence>
          {mobileMenuOpen && user && (
            <MobileMenu
              navLinks={getNavLinks(user.role)}
              user={user}
              setMobileMenuOpen={setMobileMenuOpen}
            />
          )}
          {mobileMenuOpen && !user && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 py-6 px-4"
            >
              <div className="flex flex-col gap-1 mb-4">
                {getNavLinks().map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 font-medium rounded-md transition-all duration-200 focus:outline-none bg-cyan-600 text-white"
              >
                Login
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}
