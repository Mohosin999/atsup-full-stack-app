import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FilePlus2, UploadCloud } from "lucide-react";
import { goToLogin } from "../utils/authGuard";
import { useAppSelector } from "@/hooks";
import Wrapper from "../components/Wrapper";

export default function ResumeDashboard() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="min-h-screen lg:pt-20 pb-12">
      <Wrapper>
        <div className="py-8 lg:mb-4 flex flex-col items-center justify-center">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 gap-2">
            How Would You Like to Start?
          </h1>

          <div className="text-gray-600 text-sm xl:text-base max-w-xl xl:max-w-2xl text-center space-y-4">
            <p>
              Start with our best ATS-optimized resume template, designed to
              help your resume pass applicant tracking systems while keeping a
              clean layout. You can easily drag and drop sections to organize
              your resume the way you want.
            </p>
            <p>
              Prefer to upload an existing resume? Our `Upload Resume & Rewrite
              with AI` feature is currently in development and will be available
              in a future update.
            </p>
          </div>
        </div>

        {/* Two action cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create new resume */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-cyan-50 p-4 md:p-6 xl:p-8 flex flex-col items-start rounded-lg shadow-[0_0_6px_rgba(0,0,0,0.2)]"
          >
            <div className="w-12 h-12 bg-cyan-600 text-white flex items-center justify-center mb-4">
              <FilePlus2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Create a new resume
            </h3>
            <p className="text-sm text-gray-600 mb-6 flex-1">
              Start building your resume with our easy-to-use resume builder.
              Every section is movable and editable, so you can customize it to
              your preferences. No need to save it, it'll be saved
              automatically.
            </p>
            <button
              onClick={() =>
                user
                  ? navigate("/resume-builder/new")
                  : goToLogin(navigate, "/resume-builder")
              }
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-cyan-600 hover:bg-cyan-600/90 text-white font-semibold shadow-lg shadow-cyan-500/25 transition-all"
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
            className="bg-white border-2 border-dashed border-gray-300 p-4 md:p-6 xl:p-8 flex flex-col items-start group relative rounded-lg"
          >
            <div className="w-12 h-12 bg-violet-500/10 border border-violet-500/30 flex items-center justify-center mb-4">
              <UploadCloud className="w-6 h-6 text-violet-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Upload resume and rewrite with AI
            </h3>
            <p className="text-sm text-gray-600 mb-6 flex-1">
              Upload your existing resume along with a job description, and our
              AI will rewrite and optimize your resume to match the role,
              improve ATS compatibility, and strengthen the sections that matter
              most.
            </p>
            <div className="w-full relative group/upload">
              <button
                disabled
                title="Coming soon"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 text-gray-400 cursor-not-allowed font-semibold"
              >
                <UploadCloud className="w-5 h-5" />
                Upload Resume
              </button>
              <span className="pointer-events-none absolute -top-3 right-4 opacity-0 group-hover/upload:opacity-100 transition-opacity bg-gray-900 text-white text-xs font-medium px-2.5 py-1">
                Upcoming
              </span>
            </div>
          </motion.div>
        </div>
      </Wrapper>
    </div>
  );
}
