import { useState } from "react";
import { useAppDispatch } from "../hooks/redux";
import { logoutUser } from "../store/slices/authSlice";
import ConfirmModal from "../components/ui/ConfirmModal";
import { allFeatures } from "../constants/landingData";
// import FloatingOrbs from "../components/home-page/FloatingOrbs";
import HeroSection from "../components/home-page/HeroSection";
import FeatureShowcase from "../components/home-page/FeatureShowcase";
// import StatsSection from "../components/home-page/StatsSection";
import WhyChooseUs from "../components/home-page/WhyChooseUs";
import TestimonialsSection from "../components/home-page/TestimonialsSection";
import CTASection from "../components/home-page/CTASection";
import Footer from "../components/Footer";
import { useQuery } from "@tanstack/react-query";
import { reviewApi } from "../api/api";

export default function HomePage() {
  const dispatch = useAppDispatch();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const { data: homeReviews } = useQuery({
    queryKey: ["home-reviews"],
    queryFn: async () => {
      const res = await reviewApi.getHomeReviews();
      return res.data.success ? res.data.data : [];
    },
  });

  const displayTestimonials = homeReviews && homeReviews.length > 0 ? homeReviews : [];

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await dispatch(logoutUser());
  };

  return (
    <>
      <div className="min-h-screen overflow-hidden relative">
        {/* <FloatingOrbs /> */}
        <main className="relative z-10">
          <HeroSection
            user={undefined}
            onLogout={() => setShowLogoutConfirm(true)}
          />
          <FeatureShowcase />
          {/* <StatsSection /> */}
          <WhyChooseUs features={allFeatures} />
          <TestimonialsSection testimonials={displayTestimonials} />
          <CTASection />
        </main>
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
