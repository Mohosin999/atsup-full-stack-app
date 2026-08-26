/* ===================================
CTA Section Component
=================================== */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAppSelector } from "../../hooks/redux";
import Wrapper from "../Wrapper";

export default function CTASection() {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="pb-24"
    >
      <Wrapper maxWidth="max-w-5xl">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative bg-gradient-to-br from-cyan-600 via-cyan-600 to-cyan-700 rounded-3xl p-12 overflow-hidden shadow-2xl shadow-cyan-500/40"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
          </div>
          <div className="relative text-center">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white text-sm font-semibold mb-6 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4" /> Start Your Journey Today
            </motion.div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to Boost Your Career?
            </h2>
            <p className="text-base md:text-lg text-cyan-100 mb-10 max-w-2xl mx-auto">
              Join thousands of job seekers who have transformed their resumes
              and landed their dream jobs with ResumeAI.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Link to={user ? "/ats-scan" : "/login"} className="group inline-flex items-center gap-3 py-3 px-8 bg-white text-gray-800 text-sm xl:text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                Get Started for Free{" "}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-cyan-100 text-sm"
            >
              No credit card required • Free to start • Cancel anytime
            </motion.p>
          </div>
        </motion.div>
      </Wrapper>
    </motion.section>
  );
}
