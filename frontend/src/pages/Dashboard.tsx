import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Zap,
  FileCheck,
} from "lucide-react";
import { useAppSelector } from "../hooks/redux";
import { atsScoreApi } from "../api/api";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import BackButton from "../components/ui/BackButton";
import Wrapper from "../components/Wrapper";

export default function Dashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const [totalAtsHistory, setTotalAtsHistory] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchData = async () => {
    setLoadingStats(true);
    try {
      const atsRes = await atsScoreApi.getHistory(1, 1);
      setTotalAtsHistory(atsRes.data.pagination?.total || 0);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleFocus = () => fetchData();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <Wrapper>
        <div className="mt-6 mb-1">
          <BackButton />
        </div>
        <WelcomeHeader user={user} credits={user?.subscription.credits || 0} />

        <div className="grid grid-cols-1 gap-8 mt-8">
          <div>
            <QuickStats
              credits={user?.subscription.credits || 0}
              totalAtsHistory={totalAtsHistory}
              loading={loadingStats}
            />
          </div>
        </div>
      </Wrapper>
    </div>
  );
}

const WelcomeHeader = ({ user, credits }: { user: any; credits: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-8"
  >
    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
      Welcome back, {user?.name?.split(" ")[0] || "User"}!
    </h1>
    <p className="text-gray-600 dark:text-gray-600 mt-1">
      Analyze your resume and check your job application readiness
    </p>
    {credits > 0 && (
      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-sm">
        <Zap className="w-4 h-4" />
        <span>{credits} credits remaining</span>
      </div>
    )}
  </motion.div>
);

const QuickStats = ({
  credits,
  totalAtsHistory,
  loading,
}: {
  credits: number;
  totalAtsHistory: number;
  loading: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="card"
  >
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
      Your Stats
    </h2>
    {loading ? (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    ) : (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-100 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-600 dark:text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-600">
                Available Credits
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {credits}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-100 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-600">
                ATS Analyses
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {totalAtsHistory}
              </p>
            </div>
          </div>
        </div>
      </div>
    )}

    {credits < 5 && (
      <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          Need More Credits?
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-600 mb-3">
          Get more credits to analyze more resumes.
        </p>
        <Link
          to="/plans"
          className="w-full inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 bg-orange-500 text-white hover:bg-orange-600 text-sm text-center"
        >
          Upgrade Plan
        </Link>
      </div>
    )}
  </motion.div>
);
