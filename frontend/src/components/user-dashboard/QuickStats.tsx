import { motion } from "framer-motion";
import {
  Zap,
  FileCheck,
  FileText,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import LoadingSpinner from "../ui/LoadingSpinner";

const StatCard = ({
  icon: Icon,
  label,
  value,
  delay,
}: {
  icon: any;
  label: string;
  value: number;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className={`rounded-xl border p-5`}
  >
    <div className="flex items-center justify-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-white border border-gray-300 shadow-sm flex items-center justify-center">
        <Icon className="w-4 h-4" />
      </div>
      {/* <ArrowUpRight className="w-4 h-4 opacity-50" /> */}
      <p className="text-sm text-gray-600 mt-1">{label}</p>
    </div>
    <div className="mt-4">
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {/* <p className="text-sm text-gray-600 mt-1">{label}</p> */}
    </div>
  </motion.div>
);

export default function QuickStats({
  credits,
  totalAtsHistory,
  totalResumes,
  loading,
  error,
  onRetry,
}: {
  credits: number;
  totalAtsHistory: number;
  totalResumes: number;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white rounded-2xl box-shadow border border-gray-100 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Performance Overview
        </h2>
        <TrendingUp className="w-5 h-5 text-cyan-600" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Failed to load statistics</p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={Zap}
            label="Available Credits"
            value={credits}
            delay={0.2}
          />
          <StatCard
            icon={FileCheck}
            label="ATS Analyses"
            value={totalAtsHistory}
            delay={0.25}
          />
          <StatCard
            icon={FileText}
            label="Resumes Built"
            value={totalResumes}
            delay={0.3}
          />
        </div>
      )}
    </motion.div>
  );
}
