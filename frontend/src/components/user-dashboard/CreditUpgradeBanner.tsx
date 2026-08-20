import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Award, ArrowUpRight } from "lucide-react";

export default function CreditUpgradeBanner({ credits }: { credits: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-500 p-[1px] shadow-lg"
    >
      <div className="bg-white rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Running low on credits</h3>
              <p className="text-sm text-gray-600">
                You have {credits} credits left. Upgrade to continue optimizing your resume
              </p>
            </div>
          </div>
          <Link
            to="/plans"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white font-semibold rounded-xl hover:bg-cyan-700 transition-colors shadow-md"
          >
            Upgrade Now
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
