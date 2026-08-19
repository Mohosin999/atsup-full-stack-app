/* ===================================
Resume Scan Section Component
=================================== */
import { motion } from "framer-motion";
import { ScanSearch } from "lucide-react";
import Wrapper from "../Wrapper";
import ResumeScanForm from "../ats-scan/ResumeScanForm";

export default function ResumeScanSection() {
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100 rounded-full text-cyan-700 text-sm font-semibold mb-4 border border-cyan-200"
          >
            <ScanSearch className="w-4 h-4" /> Free ATS Scan
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
            Scan Your{" "}
            <span className="bg-gradient-to-r from-green-600 to-cyan-600 bg-clip-text text-transparent">
              Resume
            </span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-gray-700 max-w-2xl mx-auto">
            Upload your resume, paste the job description, and instantly see how
            well you match.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white/70 backdrop-blur rounded-3xl shadow-lg border border-gray-200 p-6 md:p-8"
        >
          <ResumeScanForm />
        </motion.div>
      </Wrapper>
    </section>
  );
}