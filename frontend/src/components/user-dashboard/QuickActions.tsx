import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileCheck, FileText, ArrowUpRight } from "lucide-react";

export default function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white box-shadow border border-gray-100 p-6"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
      <div className="space-y-3">
        <Link
          to="/ats-scan"
          className="flex items-center justify-between gap-3 p-4 border border-gray-200 bg-cyan-100 hover:bg-cyan-100/30 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-cyan-700" />
            <div>
              <p className="text-sm font-semibold text-gray-700 ">
                Scan Resume
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-600" />
        </Link>

        <Link
          to="/resume-builder"
          className="flex items-center justify-between gap-3 p-4 border border-gray-200 bg-teal-100 hover:bg-teal-100/30 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-700" />
            <div>
              <p className="text-sm font-semibold text-gray-700 ">
                Build Resume
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-600" />
        </Link>
      </div>
    </motion.div>
  );
}
