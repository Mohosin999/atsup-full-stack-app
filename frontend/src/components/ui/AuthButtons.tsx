import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";

export default function AuthButtons() {
  return (
    <Link to="/login" className="group inline-flex items-center text-sm gap-1.5 px-4 py-2 font-medium rounded-lg transition-all duration-200 focus:outline-none bg-stone-900 dark:bg-lime-300 text-stone-50 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-lime-200">
      Login
      <LogIn className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
    </Link>
  );
}
