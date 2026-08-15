import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "./store";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Plans from "./pages/Plans";
import AtsScore from "./pages/AtsScore";
import AtsScoreDetail from "./pages/AtsScoreDetail";
import ResumeBuilder from "./pages/ResumeBuilder";
import ResumeDashboard from "./pages/ResumeDashboard";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import GoToTop from "./components/ui/GoToTop";
import ThemeWrapper from "./components/ThemeWrapper";
import ScrollToTop from "./components/ui/ScrollToTop";

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

  return user ? <Navigate to="/dashboard" /> : <>{children}</>;
}

function App() {
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
          element={
            <PrivateRoute>
              <Plans />
            </PrivateRoute>
          }
        />
        <Route
          path="/ats-score"
          element={
            <PrivateRoute>
              <AtsScore />
            </PrivateRoute>
          }
        />
        <Route
          path="/ats-score-history"
          element={<Navigate to="/ats-score" replace />}
        />
        <Route
          path="/ats-score/:id"
          element={
            <PrivateRoute>
              <AtsScoreDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/resumes"
          element={
            <PrivateRoute>
              <ResumeDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/resume-builder"
          element={<Navigate to="/resumes" replace />}
        />
        <Route
          path="/resume-builder/new"
          element={
            <PrivateRoute>
              <ResumeBuilder />
            </PrivateRoute>
          }
        />
        <Route
          path="/resume-builder/:id"
          element={
            <PrivateRoute>
              <ResumeBuilder />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <GoToTop />
    </ThemeWrapper>
  );
}

export default App;
