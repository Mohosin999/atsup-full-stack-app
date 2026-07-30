import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "./store";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Builder from "./pages/Builder";
import Plans from "./pages/Plans";
import AtsScore from "./pages/AtsScore";
import AtsScoreHistory from "./pages/AtsScoreHistory";
import ResumeBuildHistory from "./pages/ResumeBuildHistory";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
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
          path="/builder"
          element={
            <PrivateRoute>
              <Builder />
            </PrivateRoute>
          }
        />
        <Route
          path="/builder/:id"
          element={
            <PrivateRoute>
              <Builder />
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
          path="/ats-score/:id"
          element={
            <PrivateRoute>
              <AtsScore />
            </PrivateRoute>
          }
        />
        <Route
          path="/ats-score-history"
          element={
            <PrivateRoute>
              <AtsScoreHistory />
            </PrivateRoute>
          }
        />
        <Route
          path="/resume-build-history"
          element={
            <PrivateRoute>
              <ResumeBuildHistory />
            </PrivateRoute>
          }
        />
        <Route
          path="/payment/success"
          element={
            <PrivateRoute>
              <PaymentSuccess />
            </PrivateRoute>
          }
        />
        <Route
          path="/payment/cancel"
          element={
            <PrivateRoute>
              <PaymentCancel />
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
