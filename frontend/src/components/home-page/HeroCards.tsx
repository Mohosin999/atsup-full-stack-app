/* ===================================
Hero Cards Component
=================================== */
import { motion } from "framer-motion";
import { TrendingUp, Award, Star } from "lucide-react";
import { floatAnimation } from "../../animations";

export default function HeroCards() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="relative hidden lg:block"
    >
      <div className="relative h-[600px]">
        <motion.div variants={floatAnimation} animate="animate" className="absolute top-10 left-0 right-0 bg-white rounded-3xl shadow-2xl shadow-green-500/20 p-8 border border-green-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-cyan-500 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">AI Analysis</h3>
              <p className="text-sm text-gray-700">Real-time scoring</p>
            </div>
          </div>
          <div className="space-y-4">
            {[{ label: "ATS Score", value: "92%" }, { label: "Match Rate", value: "88%" }].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{item.label}</span>
                  <span className="text-lg font-bold text-green-600">{item.value}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: item.value }}
                    transition={{ duration: 1.5, delay: 1 }}
                    className="h-full bg-gradient-to-r from-green-500 to-cyan-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div variants={floatAnimation} animate="animate" transition={{ delay: 0.5 }} className="absolute top-40 -right-4 bg-gradient-to-br from-green-500 to-cyan-500 text-white rounded-2xl p-5 shadow-xl">
          <Award className="w-8 h-8 mb-2" />
          <p className="text-2xl font-bold">95%</p>
          <p className="text-sm opacity-90">Success Rate</p>
        </motion.div>
        <motion.div variants={floatAnimation} animate="animate" transition={{ delay: 1 }} className="absolute bottom-32 -left-4 bg-white rounded-2xl p-5 shadow-xl border border-green-200">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">4.9/5</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-600" />)}
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div variants={floatAnimation} animate="animate" transition={{ delay: 1.5 }} className="absolute bottom-10 right-10 bg-gradient-to-br from-green-400 to-cyan-500 text-white rounded-2xl p-5 shadow-xl">
          <TrendingUp className="w-8 h-8 mb-2" />
          <p className="text-2xl font-bold">3x</p>
          <p className="text-sm opacity-90">More Interviews</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
