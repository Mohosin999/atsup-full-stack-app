// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import { LogIn } from "lucide-react";

// import { useState } from "react";
// import { useAppSelector, useAppDispatch } from "../hooks/redux";
// import { logoutUser } from "../store/slices/authSlice";
// import ConfirmModal from "./ui/ConfirmModal";
// import NavLinks from "./NavLinks";
// import ProfileMenu from "./ProfileMenu";
// import MobileMenuButton from "./MobileMenuButton";
// import MobileMenu from "./MobileMenu";
// import AuthButtons from "./ui/AuthButtons";
// import HistoryDropdown from "./ui/HistoryDropdown";
// import ThemeToggle from "./ui/ThemeToggle";
// import Wrapper from "./Wrapper";

// interface NavLink {
//   path: string;
//   label: string;
// }

// const getNavLinks = (user?: { role?: string } | null): NavLink[] => [
//   ...(user
//     ? user.role === "admin"
//       ? [{ path: "/admin-dashboard", label: "Dashboard" }]
//       : []
//     : []),
//   { path: "/ats-scan", label: "ATS Scan" },
//   { path: "/resume-builder", label: "Resume Builder" },
// ];

// export default function Navbar() {
//   const { user } = useAppSelector((state) => state.auth);
//   const dispatch = useAppDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [profileMenuOpen, setProfileMenuOpen] = useState(false);
//   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

//   const handleLogout = async () => {
//     setShowLogoutConfirm(false);
//     await dispatch(logoutUser());
//     navigate("/");
//   };

//   return (
//     <>
//       {/* <nav className="fixed top-0 left-0 right-0 z-50 py-1 bg-white/80 border-b border-gray-200"> */}
//       <nav className="fixed top-0 left-0 right-0 z-50 py-1 bg-white dark:bg-[#2a2438]">
//         <Wrapper className="!px-4 lg:!px-16">
//           <div className="flex items-center justify-between h-14">
//             {/* Left: Logo */}
//             <Link to="/" className="flex items-center gap-2 font-mono shrink-0">
//               <img src="/favicon.png" alt="ATSUp" className="w-10 h-8" />
//               <span className="text-xl font-bold text-gray-800 dark:text-gray-100">
//                 ATS<span className="text-cyan-500">Up</span>
//               </span>
//             </Link>

//             {/* Center: Navigation links + History + Pricing */}
//             <div className="hidden lg:flex items-center justify-center flex-1 gap-2">
//               <NavLinks navLinks={getNavLinks(user)} />
//               {user && <HistoryDropdown />}
//               <Link
//                 to="/plans"
//                 className={`px-3 py-2 rounded-lg text-sm xl:text-[15px] font-medium transition-colors ${
//                   location.pathname === "/plans"
//                     ? "bg-cyan-500/20 text-cyan-600"
//                     : "text-gray-700 hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400"
//                 }`}
//               >
//                 Pricing
//               </Link>
//             </div>

//             {/* Right: Auth / Profile */}
//             <div className="flex items-center gap-3 md:gap-4 xl:gap-5 shrink-0">
//               <ThemeToggle />
//               {user ? (
//                 <ProfileMenu
//                   user={user}
//                   profileMenuOpen={profileMenuOpen}
//                   setProfileMenuOpen={setProfileMenuOpen}
//                   onLogout={() => setShowLogoutConfirm(true)}
//                 />
//               ) : (
//                 <div className="hidden lg:flex items-center">
//                   <AuthButtons />
//                 </div>
//               )}
//               <MobileMenuButton
//                 mobileMenuOpen={mobileMenuOpen}
//                 setMobileMenuOpen={setMobileMenuOpen}
//               />
//             </div>
//           </div>
//         </Wrapper>

//         {/* =============================================================
//          * Mobile menus when click on three dots
//          ==============================================================*/}
//         <AnimatePresence>
//           {mobileMenuOpen && user && (
//             <MobileMenu
//               navLinks={getNavLinks(user)}
//               user={user}
//               setMobileMenuOpen={setMobileMenuOpen}
//             />
//           )}
//           {mobileMenuOpen && !user && (
//             <motion.div
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -10 }}
//               className="lg:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 py-6 px-4 dark:bg-gray-900/95 dark:border-gray-700"
//             >
//               <div className="flex flex-col gap-1 mb-4">
//                 {getNavLinks(null).map((link) => (
//                   <Link
//                     key={link.path}
//                     to={link.path}
//                     onClick={() => setMobileMenuOpen(false)}
//                     className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
//                   >
//                     {link.label}
//                   </Link>
//                 ))}
//                 <Link
//                   to="/plans"
//                   onClick={() => setMobileMenuOpen(false)}
//                   className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
//                 >
//                   Pricing
//                 </Link>
//               </div>

//               <Link
//                 to="/login"
//                 onClick={() => setMobileMenuOpen(false)}
//                 className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 font-medium rounded-md transition-all duration-200 focus:outline-none bg-cyan-600 text-white hover:bg-cyan-700"
//               >
//                 Login
//                 <LogIn className="w-4 h-4" />
//               </Link>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </nav>

//       {/* =======================================
//        * Spacer to push content below nav
//       ========================================*/}
//       <div className="h-14 lg:h-0" aria-hidden="true" />

//       <ConfirmModal
//         isOpen={showLogoutConfirm}
//         title="Logout"
//         message="Are you sure you want to logout?"
//         confirmText="Logout"
//         cancelText="Cancel"
//         onConfirm={handleLogout}
//         onCancel={() => setShowLogoutConfirm(false)}
//       />
//     </>
//   );
// }

import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn } from "lucide-react";

import { useState } from "react";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { logoutUser } from "../store/slices/authSlice";
import ConfirmModal from "./ui/ConfirmModal";
import NavLinks from "./NavLinks";
import ProfileMenu from "./ProfileMenu";
import MobileMenuButton from "./MobileMenuButton";
import MobileMenu from "./MobileMenu";
import AuthButtons from "./ui/AuthButtons";
import HistoryDropdown from "./ui/HistoryDropdown";
import ThemeToggle from "./ui/ThemeToggle";
import Wrapper from "./Wrapper";

interface NavLink {
  path: string;
  label: string;
}

const getNavLinks = (user?: { role?: string } | null): NavLink[] => [
  ...(user
    ? user.role === "admin"
      ? [{ path: "/admin-dashboard", label: "Dashboard" }]
      : []
    : []),
  { path: "/ats-scan", label: "ATS Scan" },
  { path: "/resume-builder", label: "Resume Builder" },
];

export default function Navbar() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
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
      <nav className="font-plex fixed top-0 left-0 right-0 z-50 py-1 bg-white/90 dark:bg-stone-950/90 backdrop-blur-sm border-b border-stone-200 dark:border-stone-800">
        <Wrapper className="!px-4 lg:!px-16">
          <div className="flex items-center justify-between h-14">
            {/* Left: Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img src="/favicon.png" alt="ATSUp" className="w-10 h-8" />
              <span className="font-fraunces text-xl text-stone-900 dark:text-stone-50">
                ATS<span className="relative inline-block">
                  <span className="relative z-10">Up</span>
                  <span className="absolute left-0 right-0 bottom-[0.1em] h-[0.28em] bg-lime-300/80 dark:bg-lime-400/60 rounded-[2px] -z-0" />
                </span>
              </span>
            </Link>

            {/* Center: Navigation links + History + Pricing */}
            <div className="hidden lg:flex items-center justify-center flex-1 gap-2">
              <NavLinks navLinks={getNavLinks(user)} />
              {user && <HistoryDropdown />}
              <Link
                to="/plans"
                className={`px-3 py-2 rounded-lg text-sm xl:text-[15px] font-medium transition-colors ${
                  location.pathname === "/plans"
                    ? "bg-lime-100 text-stone-900 dark:bg-lime-400/10 dark:text-lime-200"
                    : "text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-50"
                }`}
              >
                Pricing
              </Link>
            </div>

            {/* Right: Auth / Profile */}
            <div className="flex items-center gap-3 md:gap-4 xl:gap-5 shrink-0">
              <ThemeToggle />
              {user ? (
                <ProfileMenu
                  user={user}
                  profileMenuOpen={profileMenuOpen}
                  setProfileMenuOpen={setProfileMenuOpen}
                  onLogout={() => setShowLogoutConfirm(true)}
                />
              ) : (
                <div className="hidden lg:flex items-center">
                  <AuthButtons />
                </div>
              )}
              <MobileMenuButton
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
              />
            </div>
          </div>
        </Wrapper>

        {/* =============================================================
         * Mobile menus when click on three dots
         ==============================================================*/}
        <AnimatePresence>
          {mobileMenuOpen && user && (
            <MobileMenu
              navLinks={getNavLinks(user)}
              user={user}
              setMobileMenuOpen={setMobileMenuOpen}
            />
          )}
          {mobileMenuOpen && !user && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="font-plex lg:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-stone-200 py-6 px-4 dark:bg-stone-950/95 dark:border-stone-800"
            >
              <div className="flex flex-col gap-1 mb-4">
                {getNavLinks(null).map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/plans"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60"
                >
                  Pricing
                </Link>
              </div>

              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 font-semibold rounded-lg transition-colors focus:outline-none bg-stone-900 text-stone-50 hover:bg-stone-800 dark:bg-lime-300 dark:text-stone-900 dark:hover:bg-lime-200"
              >
                Login
                <LogIn className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* =======================================
       * Spacer to push content below nav
      ========================================*/}
      <div className="h-14 lg:h-0" aria-hidden="true" />

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        .font-fraunces { font-family: 'Fraunces', serif; }
        .font-plex { font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>
    </>
  );
}