import { Link } from "react-router-dom";

export default function AuthButtons() {
  return (
    <>
      <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium">
        Login
      </Link>
      <Link to="/login" className="gradient-btn">
        Get Started
      </Link>
    </>
  );
}
