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
            className={`block px-3 py-2 rounded-lg text-sm font-medium hover:bg-cyan-500/20 ${
              location.pathname === link.path
                ? "bg-cyan-500/20 text-cyan-600"
                : "text-gray-700"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}

        <div className="border-t border-gray-200 mt-2 pt-2">
          <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">History</p>
          <Link
            to="/scan-history"
            className={`block px-3 py-2 rounded-lg text-sm font-medium hover:bg-cyan-500/20 ${
              location.pathname === "/scan-history"
                ? "bg-cyan-500/20 text-cyan-600"
                : "text-gray-700"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Scan History
          </Link>
          <Link
            to="/resume-history"
            className={`block px-3 py-2 rounded-lg text-sm font-medium hover:bg-cyan-500/20 ${
              location.pathname === "/resume-history"
                ? "bg-cyan-500/20 text-cyan-600"
                : "text-gray-700"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Resume History
          </Link>
        </div>

        <div className="border-t border-gray-200 mt-2 pt-2">
          <Link
            to="/plans"
            className={`block px-3 py-2 rounded-lg text-sm font-medium hover:bg-cyan-500/20 ${
              location.pathname === "/plans"
                ? "bg-cyan-500/20 text-cyan-600"
                : "text-gray-700"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Pricing
          </Link>
        </div>

      </div>
    </motion.div>
  );
}
