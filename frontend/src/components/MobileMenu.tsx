/* ===================================
Mobile Menu Component
=================================== */
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

interface NavLink {
  path: string;
  label: string;
}

export default function MobileMenu({ navLinks, user, setMobileMenuOpen }: { navLinks: NavLink[]; user: any; setMobileMenuOpen: (v: boolean) => void }) {
  const location = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="md:hidden bg-gray-50 border-t border-gray-200"
    >
      <div className="px-4 py-3 space-y-2">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`block px-3 py-2 rounded-lg text-sm font-medium ${
              location.pathname === link.path
                ? "bg-green-500/20 text-green-600"
                : "text-gray-700"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}

        <Link to="/plans" className="block px-3 py-2 rounded-lg text-sm font-medium text-orange-600" onClick={() => setMobileMenuOpen(false)}>
          Upgrade Plan
        </Link>
        <div className="px-3 py-2 text-sm text-gray-600">{user.subscription.credits} credits</div>
        
        <div className="border-t border-gray-200 mt-2 pt-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-800 via-cyan-700 to-cyan-600 flex items-center justify-center text-white text-sm font-medium">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-600 truncate">{user.email}</p>
            </div>
          </div>
          <Link to="/settings" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>
            Settings
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
