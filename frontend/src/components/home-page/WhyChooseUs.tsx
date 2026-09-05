import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../animations";
import Wrapper from "../Wrapper";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface WhyChooseUsProps {
  features: Feature[];
}

export default function WhyChooseUs({ features }: WhyChooseUsProps) {
  return (
    <section className="pb-20 lg:pb-20 xl:pb-28">
      <Wrapper>
        <div className="text-center mb-6 lg:mb-8">
          <h2 className="text-2xl xl:text-3xl font-semibold text-gray-800 dark:text-gray-100">
            Why Choose ATS
            <span className="text-cyan-500">Up</span>?
          </h2>
          <p className="mt-3 text-sm md:text-base text-gray-700 dark:text-gray-300 max-w-lg md:max-w-xl xl:max-w-3xl 2xl:max-w-4xl mx-auto">
            There are many ATS-checking tools available in the market, but we
            give you AI-powered, accurate analysis — so you can optimize your
            resume with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              whileHover={{ y: -10, transition: { duration: 0.1 } }}
              className="group relative bg-white/70 backdrop-blur rounded-3xl p-8 shadow-md hover:shadow-lg hover:shadow-cyan-500/90 border border-gray-200 transition-all duration-300 overflow-hidden dark:bg-secondary dark:border-accent"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-cyan-500 via-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg 2xl:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 text-center">
                  {feature.title}
                </h3>
                <p className="text-sm 2xl:text-base text-gray-700 dark:text-gray-300 text-center leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </Wrapper>
    </section>
  );
}
