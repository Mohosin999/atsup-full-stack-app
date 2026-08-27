import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "./store";
import { consumeRedirect } from "./utils/authGuard";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import Plans from "./pages/Plans";
import AtsScore from "./pages/AtsScore";
import AtsScoreDetail from "./pages/AtsScoreDetail";
import ScanHistory from "./pages/ScanHistory";
import ResumeHistory from "./pages/ResumeHistory";
import ResumeBuilder from "./pages/ResumeBuilder";
import ResumeDashboard from "./pages/ResumeDashboard";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import ThemeWrapper from "./components/ThemeWrapper";
import ScrollToTop from "./components/ui/ScrollToTop";
import AdminDashboard from "./pages/AdminDashboard";
import MyReports from "./pages/MyReports";
import ReviewModal from "./components/ReviewModal";
import ReportButton from "./components/support/ReportButton";
import { useVisitorTracking } from "./hooks/useVisitorTracking";
import { Star } from "lucide-react";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = useSelector((state: RootState) => state.auth.user);
  const loading = useSelector((state: RootState) => state.auth.loading);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const user = useSelector((state: RootState) => state.auth.user);
  const loading = useSelector((state: RootState) => state.auth.loading);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return user ? <Navigate to={user.role === "admin" ? "/admin-dashboard" : "/"} /> : <>{children}</>;
}

function App() {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const [reviewOpen, setReviewOpen] = useState(false);
  const location = useLocation();

  const reviewButtonPages = ["/ats-scan", "/resume-builder", "/scan-history", "/resume-history", "/my-reports"];
  const showReviewButton = user && reviewButtonPages.some((p) => location.pathname.startsWith(p));

  useVisitorTracking();

  useEffect(() => {
    const handleOpen = () => setReviewOpen(true);
    window.addEventListener("open-review-modal", handleOpen);
    return () => window.removeEventListener("open-review-modal", handleOpen);
  }, []);

  // After a successful login (incl. Google OAuth round-trip), return to the
  // page the user came from. For email/password & OAuth, stay on home page.
  useEffect(() => {
    if (!user) return;
    console.log("App.tsx - Google OAuth user:", user, "role:", user.role);
    const redirect = consumeRedirect();
    if (redirect) {
      console.log("Redirecting to saved:", redirect);
      navigate(redirect, { replace: true });
    } else if (window.location.pathname === "/login") {
      console.log("No saved redirect, role-based redirect to:", user.role === "admin" ? "/admin-dashboard" : "/");
      navigate(user.role === "admin" ? "/admin-dashboard" : "/", { replace: true });
    }
    // If already on "/" after OAuth (backend redirects to frontendUrl), stay on home page
  }, [user, navigate]);

  return (
    <ThemeWrapper>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route
          path="/plans"
          element={<Plans />}
        />
        <Route
          path="/ats-scan"
          element={<AtsScore />}
        />
        <Route
          path="/ats-score-history"
          element={<Navigate to="/ats-scan" replace />}
        />
        <Route
          path="/ats-scan/:id"
          element={
            <PrivateRoute>
              <AtsScoreDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/scan-history"
          element={
            <PrivateRoute>
              <ScanHistory />
            </PrivateRoute>
          }
        />
        <Route
          path="/resume-history"
          element={
            <PrivateRoute>
              <ResumeHistory />
            </PrivateRoute>
          }
        />
        <Route
          path="/resume-builder"
          element={<ResumeDashboard />}
        />

        <Route
          path="/resume-builder/new"
          element={<ResumeBuilder />}
        />
        <Route
          path="/resume-builder/:id"
          element={<ResumeBuilder />}
        />
        <Route path="/my-reports" element={<PrivateRoute><MyReports /></PrivateRoute>} />
        <Route path="/admin-dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* ============== Review Modal & Button ============= */}
      {showReviewButton && (
        <button
          type="button"
          onClick={() => setReviewOpen(true)}
          title="Give a review"
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-orange-300 text-gray-800 hover:bg-orange-300/90 transition-colors"
        >
          <Star className="w-5 h-5" />
          <span className="hidden md:inline text-sm font-medium">Review</span>
        </button>
      )}
      <ReviewModal isOpen={reviewOpen} onClose={() => setReviewOpen(false)} />
      <ReportButton />
    </ThemeWrapper>
  );
}

export default App;
