import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../hooks/redux";
import { atsScoreApi, resumeApi } from "../api/api";
import Wrapper from "../components/Wrapper";
import WelcomeHeader from "../components/user-dashboard/WelcomeHeader";
import QuickStats from "../components/user-dashboard/QuickStats";
import QuickActions from "../components/user-dashboard/QuickActions";
import CreditUpgradeBanner from "../components/user-dashboard/CreditUpgradeBanner";
import RecentAtsScans from "../components/user-dashboard/RecentAtsScans";
import RecentResumes from "../components/user-dashboard/RecentResumes";

export default function Dashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const [totalAtsHistory, setTotalAtsHistory] = useState(0);
  const [totalResumes, setTotalResumes] = useState(0);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [recentResumes, setRecentResumes] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState(false);

  const fetchData = async () => {
    setLoadingStats(true);
    setStatsError(false);
    try {
      const [atsRes, resumesRes, recentScansRes, recentResumesRes] =
        await Promise.all([
          atsScoreApi.getHistory(1, 1),
          resumeApi.getAll(1, 1),
          atsScoreApi.getHistory(1, 5),
          resumeApi.getAll(1, 5),
        ]);
      setTotalAtsHistory(atsRes.data.pagination?.total || 0);
      setTotalResumes(resumesRes.data.pagination?.total || 0);
      setRecentScans(recentScansRes.data.data || []);
      setRecentResumes(recentResumesRes.data.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setStatsError(true);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [location.pathname]);

  if (user && user.role === "admin") {
    return <Navigate to="/admin-dashboard" replace />;
  }

  const credits = user?.subscription?.credits || 0;
  const subscriptionPlan = user?.subscription?.plan || "Free";

  return (
    <div className="min-h-screen bg-[#F6F9FC] pt-20 pb-12">
      <Wrapper>
        <div className="space-y-8 mt-6">
          <WelcomeHeader user={user} credits={credits} plan={subscriptionPlan} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <QuickStats
                credits={credits}
                totalAtsHistory={totalAtsHistory}
                totalResumes={totalResumes}
                loading={loadingStats}
                error={statsError}
                onRetry={fetchData}
              />
            </div>

            <QuickActions />
          </div>

          <RecentAtsScans
            scans={recentScans}
            loading={loadingStats}
            onDelete={(id) => {
              setRecentScans((prev) => prev.filter((s: any) => (s.id || s._id) !== id));
              setTotalAtsHistory((prev) => Math.max(0, prev - 1));
            }}
          />
          <RecentResumes
            resumes={recentResumes}
            loading={loadingStats}
            onDelete={(id) => {
              setRecentResumes((prev) => prev.filter((r: any) => (r.id || r._id) !== id));
              setTotalResumes((prev) => Math.max(0, prev - 1));
            }}
          />

          {credits < 5 && <CreditUpgradeBanner credits={credits} />}
        </div>
      </Wrapper>
    </div>
  );
}
