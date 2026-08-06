/* ===================================
Features Section Component
=================================== */
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { fadeInUp, staggerContainer } from "../../animations";
import Wrapper from "../Wrapper";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface FeaturesSectionProps {
  features: Feature[];
}

export default function FeaturesSection({ features }: FeaturesSectionProps) {
  return (
    <section className="py-24">
      <Wrapper>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-semibold mb-4 border border-green-200"
          >
            <Zap className="w-4 h-4" /> Powerful Features
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
            Why Choose CV
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Coach?
            </span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-gray-700 max-w-2xl mx-auto">
            Everything you need to analyze, create, and optimize your resume for
            success
          </p>
        </motion.div>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="group relative bg-white/70 backdrop-blur rounded-3xl p-8 shadow-lg hover:shadow-2xl hover:shadow-green-500/20 border border-gray-200 hover:border-green-600 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-700 text-center leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Wrapper>
    </section>
  );
}
