import { Link } from "react-router-dom";
import { Crown } from "lucide-react";

export default function UpgradeButton() {
  return (
    <Link
      to="/plans"
      className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-cyan-600 dark:text-gray-300 transition-colors"
    >
      <Crown className="w-4 h-4" /> Pricing
    </Link>
  );
}
