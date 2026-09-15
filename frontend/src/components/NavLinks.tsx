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
          className={`px-3 py-2 rounded-lg text-sm xl:text-[15px] font-medium transition-colors ${
            location.pathname === link.path
              ? "bg-lime-100 text-stone-900 dark:bg-lime-400/10 dark:text-lime-200"
              : "text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-50"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
