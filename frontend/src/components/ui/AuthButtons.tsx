import { Link } from "react-router-dom";

export default function AuthButtons() {
  return (
    <Link to="/login" className="px-4 py-2 font-medium rounded-md transition-all duration-200 focus:outline-none bg-cyan-600 text-white">
      Login
    </Link>
  );
}
