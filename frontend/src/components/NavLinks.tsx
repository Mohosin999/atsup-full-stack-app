import { Link, useLocation } from "react-router-dom";

interface NavLink {
  path: string;
  label: string;
  icon?: React.ElementType;
}

export default function NavLinks({ navLinks }: { navLinks: NavLink[] }) {
  const location = useLocation();
  return (
    <div className="hidden lg:flex items-center gap-1">
      {navLinks.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            location.pathname === link.path
              ? "bg-cyan-500/20 text-cyan-600"
              : "text-gray-700 hover:text-cyan-600"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
