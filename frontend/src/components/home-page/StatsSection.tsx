/* ===================================
Stats Section Component
=================================== */
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp } from "../../animations";
import Wrapper from "../Wrapper";

export default function StatsSection() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="py-16 bg-gradient-to-r from-green-600 via-emerald-600 to-green-700"
    >
      <Wrapper>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: "10K+", label: "Active Users" },
            { value: "50K+", label: "Resumes Analyzed" },
            { value: "95%", label: "Success Rate" },
            { value: "4.9/5", label: "User Rating" },
          ].map((stat, index) => (
            <motion.div key={stat.label} variants={fadeInUp} className="text-center">
              <motion.p
                initial={{ scale: 0.5 }}
                whileInView={{ scale: 1 }}
                transition={{ type: "spring", delay: index * 0.1 }}
                className="text-4xl sm:text-5xl font-bold text-white"
              >
                {stat.value}
              </motion.p>
              <p className="mt-2 text-green-100 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </Wrapper>
    </motion.section>
  );
}
