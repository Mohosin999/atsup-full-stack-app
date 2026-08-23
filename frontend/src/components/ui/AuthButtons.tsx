import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function AuthButtons() {
  return (
    <Link to="/login" className="group inline-flex items-center gap-1.5 px-4 py-2 font-medium rounded-md transition-all duration-200 focus:outline-none bg-cyan-600 text-white hover:bg-cyan-700">
      Login
      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
    </Link>
  );
}
