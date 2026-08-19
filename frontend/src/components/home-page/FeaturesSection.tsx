import { motion } from "framer-motion";
import { fadeInUp } from "../../animations";
import WrapperHome from "../WrapperHome";

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
    <section className="pb-24">
      <WrapperHome>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-semibold text-gray-800">
            Why Choose ATS
            <span className="text-cyan-500">Up</span>?
          </h2>
          <p className="mt-4 text-base md:text-lg text-gray-700 max-w-4xl mx-auto">
            There are many ATS-checking tools available in the market, but we’re giving you free, unlimited access to some of our features — so you can optimize your resume without any limits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              whileHover={{ y: -10, transition: { duration: 0.1 } }}
              className="group relative bg-white/70 backdrop-blur rounded-3xl p-8 shadow-md hover:shadow-lg hover:shadow-cyan-500/90 border border-gray-200 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-cyan-500 via-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform duration-300">
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
        </div>
      </WrapperHome>
    </section>
  );
}
