import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, FileCheck } from "lucide-react";

export default function WelcomeHeader({
  user,
  credits,
  plan,
}: {
  user: any;
  credits: number;
  plan: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-cyan-600 p-8 text-white shadow-lg shadow-cyan-100"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/5 rounded-full" />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {user?.name?.split(" ")[0] || "User"}!
            </h1>
            <p className="mt-2 text-cyan-50 text-sm md:text-base xl:text-lg">
              All your activities are in one place. Keep track of your progress and improve your resume.
            </p>
          </div>

          <div className="hidden md:block w-72 xl:w-60">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-3 ml-20">
              <p className="text-xs font-medium text-cyan-50 uppercase tracking-wider">
                Current Plan
              </p>
              <p className="text-lg font-bold">{plan}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col md:flex-row items-center gap-3">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2">
            <Zap className="w-4 h-4 text-yellow-300" fill="currentColor" />
            <span className="font-semibold">{credits} Credits Available</span>
          </div>
          <Link
            to="/ats-scan"
            className="inline-flex items-center gap-2 bg-white text-cyan-700 px-4 py-2 font-semibold hover:bg-cyan-50 transition-colors"
          >
            <FileCheck className="w-4 h-4" />
            Start Scan
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
