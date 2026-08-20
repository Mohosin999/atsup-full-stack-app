/* ===================================
Mobile Menu Button Component
=================================== */
import { Menu, X } from "lucide-react";

export default function MobileMenuButton({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen: boolean; setMobileMenuOpen: (v: boolean) => void }) {
  return (
    <button className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
      {mobileMenuOpen ? <X className="w-6 h-6 text-gray-800" /> : <Menu className="w-6 h-6 text-gray-800" />}
    </button>
  );
}
