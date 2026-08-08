import { useState } from "react";
import { useAppDispatch } from "../hooks/redux";
import { logoutUser } from "../store/slices/authSlice";
import ConfirmModal from "../components/ui/ConfirmModal";
import {
  allFeatures,
  analysisSteps,
  testimonials,
} from "../constants/landingData";
import FloatingOrbs from "../components/home-page/FloatingOrbs";
import HeroSection from "../components/home-page/HeroSection";
import StatsSection from "../components/home-page/StatsSection";
import FeaturesSection from "../components/home-page/FeaturesSection";
import HowItWorksSection from "../components/home-page/HowItWorksSection";
import TestimonialsSection from "../components/home-page/TestimonialsSection";
import CTASection from "../components/home-page/CTASection";
import Footer from "../components/Footer";

export default function HomePage() {
  const dispatch = useAppDispatch();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await dispatch(logoutUser());
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden relative">
        <FloatingOrbs />
        <main className="relative z-10">
          <HeroSection
            user={undefined}
            onLogout={() => setShowLogoutConfirm(true)}
          />
          <StatsSection />
          <FeaturesSection features={allFeatures} />
          <HowItWorksSection steps={analysisSteps} />
          <TestimonialsSection testimonials={testimonials} />
          <CTASection />
        </main>
        <Footer />
      </div>
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        type="warning"
      />
    </>
  );
}
