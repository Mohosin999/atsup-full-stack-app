import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Zap,
  Plus,
  ChevronRight,
  FileCheck,
} from "lucide-react";
import { useAppSelector } from "../hooks/redux";
import { atsScoreApi, resumeBuildHistoryApi } from "../api/api";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import BackButton from "../components/ui/BackButton";

export default function Dashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const [recentBuilds, setRecentBuilds] = useState<any[]>([]);
  const [totalResumes, setTotalResumes] = useState(0);
  const [totalAtsHistory, setTotalAtsHistory] = useState(0);
  const [loadingBuilds, setLoadingBuilds] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchData = async () => {
    setLoadingBuilds(true);
    setLoadingStats(true);
    try {
      const [buildRes, atsRes] = await Promise.all([
        resumeBuildHistoryApi.getAll(1, 5),
        atsScoreApi.getAll(1, 1),
      ]);
      const data = {
        recentBuilds: buildRes.data.data || [],
        totalResumes: buildRes.data.pagination?.total || 0,
        totalAtsHistory: atsRes.data.pagination?.total || 0,
      };
      localStorage.setItem('dashboardData', JSON.stringify(data));
      setRecentBuilds(data.recentBuilds);
      setTotalResumes(data.totalResumes);
      setTotalAtsHistory(data.totalAtsHistory);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoadingBuilds(false);
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem('dashboardData');
    if (cached) {
      const data = JSON.parse(cached);
      setRecentBuilds(data.recentBuilds);
      setTotalResumes(data.totalResumes);
      setTotalAtsHistory(data.totalAtsHistory);
      setLoadingBuilds(false);
      setLoadingStats(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const handleFocus = () => fetchData();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const features = [
    {
      title: "ATS Score Check",
      description:
        "Analyze your resume for ATS compatibility and get detailed feedback",
      icon: FileCheck,
      color: "bg-amber-600",
      link: "/ats-score",
      stats: "Check how ATS systems read your resume",
    },
    {
      title: "Resume Builder",
      description: "Build professional resumes with AI-powered suggestions",
      icon: FileText,
      color: "bg-lime-600",
      link: "/builder",
      stats: "Create resume from scratch",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-12 text-">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-6 mb-1">
          <BackButton />
        </div>
        <WelcomeHeader user={user} credits={user?.subscription.credits || 0} />

        <FeaturesGrid features={features} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <RecentBuilds builds={recentBuilds} loading={loadingBuilds} />
          </div>
          <div>
            <QuickStats
              credits={user?.subscription.credits || 0}
              totalResumes={totalResumes}
              totalAtsHistory={totalAtsHistory}
              loading={loadingStats}
            />
          </div>
        </div>
      </div>
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
    <p className="text-gray-600 dark:text-gray-400 mt-1">
      Manage your resumes and check your job application readiness
    </p>
    {credits > 0 && (
      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-sm">
        <Zap className="w-4 h-4" />
        <span>{credits} credits remaining</span>
      </div>
    )}
  </motion.div>
);

const FeaturesGrid = ({ features }: { features: any[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    {features.map((feature, index) => (
      <motion.div
        key={feature.title}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Link
          to={feature.link}
          className="card block h-full hover:shadow-lg transition-shadow group"
        >
          <div
            className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}
          >
            <feature.icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
            {feature.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-3">
            {feature.description}
          </p>
          <div className="flex items-center gap-1 text-sm text-primary font-medium">
            <span>{feature.stats}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>
      </motion.div>
    ))}
  </div>
);

const RecentBuilds = ({ builds, loading }: { builds: any[]; loading: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="card"
  >
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Recent Resumes
      </h2>
      <Link
        to="/resume-build-history"
        className="text-sm text-primary hover:underline flex items-center gap-1"
      >
        View all
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
    {loading ? (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    ) : builds.length > 0 ? (
      <div className="space-y-4">
        {builds.map((item) => (
          <Link
            key={item._id}
            to={`/builder/${item._id}`}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {item.resumeContent?.personalInfo?.fullName ||
                    item.title ||
                    "Resume"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.resumeContent?.personalInfo?.jobTitle || "Untitled"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
          </Link>
        ))}
      </div>
    ) : (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No resumes yet</p>
        <Link
          to="/builder"
          className="mt-4 gradient-btn gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Resume
        </Link>
      </div>
    )}
  </motion.div>
);

const QuickStats = ({
  credits,
  totalResumes,
  totalAtsHistory,
  loading,
}: {
  credits: number;
  totalResumes: number;
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
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Available Credits
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {credits}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ATS Analyses
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {totalAtsHistory}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Resumes
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {totalResumes}
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
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
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
