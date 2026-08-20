import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FilePlus2,
  UploadCloud,
  FileText,
  Sparkles,
} from "lucide-react";
import { goToLogin } from "../utils/authGuard";
import { useAppSelector } from "@/hooks";
import Wrapper from "../components/Wrapper";

export default function ResumeDashboard() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <Wrapper maxWidth="max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <FileText className="w-8 h-8 text-cyan-600" />
            Resume Builder
          </h1>
          <p className="text-gray-600 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-600" />
            Build ATS-friendly resumes in minutes, preview live and download.
          </p>
        </motion.div>

        {/* Two action cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create new resume */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-gradient-to-br from-cyan-50 to-cyan-50 border border-cyan-200 rounded-2xl p-6 flex flex-col items-start"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/25">
              <FilePlus2 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Create a New Resume
            </h3>
            <p className="text-sm text-gray-600 mb-6 flex-1">
              Start from scratch with our live builder. Fill in your details
              and watch an ATS-friendly resume render in real time.
            </p>
            <button
              onClick={() =>
                user
                  ? navigate("/resume-builder/new")
                  : goToLogin(navigate, "/resume-builder")
              }
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-cyan-500/25 transition-all"
            >
              <FilePlus2 className="w-5 h-5" />
              Create Resume
            </button>
          </motion.div>

          {/* Upload resume (upcoming) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-start group relative"
          >
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center mb-4">
              <UploadCloud className="w-7 h-7 text-violet-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Upload Resume & Rewrite with AI
            </h3>
            <p className="text-sm text-gray-600 mb-6 flex-1">
              Upload an existing resume and let AI rewrite, structure and
              optimize it for ATS.
            </p>
            <div className="w-full relative">
              <button
                disabled
                title="Coming soon"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed font-semibold"
              >
                <UploadCloud className="w-5 h-5" />
                Upload Resume
              </button>
              <span className="pointer-events-none absolute -top-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                Upcoming
              </span>
            </div>
          </motion.div>
        </div>
      </Wrapper>
    </div>
  );
}