import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "./store";
import { consumeRedirect } from "./utils/authGuard";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
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
import ReportButton from "./components/support/ReportButton";
import { useVisitorTracking } from "./hooks/useVisitorTracking";

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

  return user ? <Navigate to={user.role === "admin" ? "/admin-dashboard" : "/dashboard"} /> : <>{children}</>;
}

function App() {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  useVisitorTracking();

  // After a successful login (incl. Google OAuth round-trip), return to the
  // page the user came from.
  useEffect(() => {
    if (!user) return;
    const redirect = consumeRedirect();
    if (redirect) {
      navigate(redirect, { replace: true });
    }
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
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
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
      {user && <ReportButton />}
    </ThemeWrapper>
  );
}

export default App;
