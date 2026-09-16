import { useState } from "react";
import { useAppDispatch } from "../hooks/redux";
import { logoutUser } from "../store/slices/authSlice";
import ConfirmModal from "../components/ui/ConfirmModal";
import { allFeatures, staticReviews } from "../constants/landingData";
import HeroSection from "../components/home-page/HeroSection";
import FeatureShowcase from "../components/home-page/FeatureShowcase";
import StatsBar from "../components/home-page/StatsBar";
import HowItWorksTabs from "../components/home-page/HowItWorksTabs";
import ATSCategories from "../components/home-page/ATSCategories";
import AIRewriteShowcase from "../components/home-page/AIRewriteShowcase";
import BuilderPreview from "../components/home-page/BuilderPreview";
import PricingTeaser from "../components/home-page/PricingTeaser";
import WhyChooseUs from "../components/home-page/WhyChooseUs";
import ComparisonSection from "../components/home-page/ComparisonSection";
import FAQSection from "../components/home-page/FAQSection";
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

  // Static 6 always show; approved reviews replace one-by-one from start
  const approved = homeReviews || [];
  const displayTestimonials =
    approved.length === 0
      ? staticReviews
      : approved.length >= 6
        ? approved.slice(0, 6)
        : [...approved, ...staticReviews.slice(approved.length)].slice(0, 6);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await dispatch(logoutUser());
  };

  return (
    <>
      <div className="min-h-screen overflow-hidden relative">
        <main className="relative z-10">
          <HeroSection user={undefined} onLogout={() => setShowLogoutConfirm(true)} />
          <FeatureShowcase />
          {/* <StatsBar /> */}
          <HowItWorksTabs />
          <ATSCategories />
          <AIRewriteShowcase />
          <BuilderPreview />
          {/* <WhyChooseUs features={allFeatures} /> */}
          <ComparisonSection />
          {/* <PricingTeaser /> */}
          <TestimonialsSection testimonials={displayTestimonials} />
          <FAQSection />
          {/* <CTASection /> */}
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
