/* ===================================
How It Works Section Component
=================================== */
import { motion } from "framer-motion";
import { Award, ChevronRight } from "lucide-react";
import { fadeInUp, staggerContainer } from "../../animations";

interface Step {
  number: string;
  title: string;
  description: string;
}

interface HowItWorksSectionProps {
  activeTab: "analysis" | "creation";
  setActiveTab: (tab: "analysis" | "creation") => void;
  steps: Step[];
}

export default function HowItWorksSection({ activeTab, setActiveTab, steps }: HowItWorksSectionProps) {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-800/50 via-green-900/10 to-gray-800/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full text-green-400 text-sm font-semibold mb-4 border border-gray-700"
          >
            <Award className="w-4 h-4" /> Simple Process
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8">
            How It <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Works</span>
          </h2>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="inline-flex bg-gray-800 rounded-xl p-1 border border-gray-700"
          >
            <button
              onClick={() => setActiveTab("analysis")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === "analysis"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Resume Analysis
            </button>
            <button
              onClick={() => setActiveTab("creation")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === "creation"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Resume Builder
            </button>
          </motion.div>
        </motion.div>
        <motion.div
          key={activeTab}
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={fadeInUp}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", delay: index * 0.1 }}
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 rounded-3xl flex items-center justify-center shadow-xl shadow-green-500/30 group-hover:scale-110 transition-transform duration-300"
                >
                  <span className="text-4xl font-bold text-white">{step.number}</span>
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-300 leading-relaxed text-sm">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 -right-4">
                  <ChevronRight className="w-8 h-8 text-green-700" />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
