import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileCheck, FileText, ArrowUpRight } from "lucide-react";

export default function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
      <div className="space-y-3">
        <Link
          to="/ats-checker"
          className="flex items-center gap-3 p-4 rounded-xl bg-cyan-50 hover:bg-cyan-100 transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-cyan-600 flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 group-hover:text-cyan-700">ATS Check</p>
            <p className="text-sm text-gray-600">Analyze resume score</p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-600" />
        </Link>

        <Link
          to="/resume-builder"
          className="flex items-center gap-3 p-4 rounded-xl bg-sky-50 hover:bg-sky-100 transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 group-hover:text-sky-700">Build Resume</p>
            <p className="text-sm text-gray-600">Create professional resume</p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-sky-600" />
        </Link>
      </div>
    </motion.div>
  );
}
