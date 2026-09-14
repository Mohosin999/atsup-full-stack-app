import { Link } from "react-router-dom";
import { ChevronRight, FilePlus2 } from "lucide-react";
import Wrapper from "../Wrapper";
import HeroUploadBox from "./HeroUploadBox";

interface HeroSectionProps {
  user: any;
  onLogout: () => void;
}

export default function HeroSection({ user, onLogout }: HeroSectionProps) {
  return (
    <section className="pt-10 md:pt-14 lg:pt-6 xl:pt-20 2xl:pt-24 pb-10 md:pb-12 lg:pb-10 xl:pb-14">
      <Wrapper>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-6 xl:gap-10 items-center">
          {/* Left Content */}
          <div className="lg:col-span-3 text-center lg:text-start">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/20 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              7 Free AI Scans Daily — No Credit Card
            </div>

            <div className="text-4xl md:text-5xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-gray-800 dark:text-gray-100 md:space-y-3 xl:space-y-4">
              <h1>Prepare your resume for</h1>
              <h1>
                the{" "}
                <span className="relative inline-block px-1">
                  <span className="relative z-10 text-gray-800 dark:text-gray-100">
                    ATS screening
                  </span>
                  <span className="absolute left-0 right-0 bottom-1 h-8 md:h-10 lg:h-8 xl:h-10 2xl:h-12 bg-cyan-200/80 dark:bg-secondary rounded-sm -z-0" />
                </span>
              </h1>
            </div>

            <p className="my-8 lg:my-6 xl:my-8 text-base xl:text-lg text-gray-700 dark:text-gray-300 max-w-xl mx-auto lg:mx-0">
              Analyze your resume against any job description and get actionable
              feedback to improve its ATS compatibility. Build an ATS-friendly
              resume (PDF only) that helps you stand out to employers.
            </p>

            <div className="flex flex-col md:flex-row justify-center lg:justify-start gap-4 mx-6 md:mx-0">
              <Link
                to="/ats-scan"
                className="group flex items-center justify-center bg-cyan-600 text-white px-6 py-3 lg:py-2.5 rounded-xl text-xs md:text-sm xl:text-base gap-2 font-semibold hover:bg-cyan-700 shadow-lg shadow-cyan-500/20 transition-all"
              >
                Scan Your Resume for Free
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/resume-builder"
                className="flex items-center justify-center gap-2 text-xs md:text-sm xl:text-base border-2 border-gray-600 hover:bg-gray-600/10 dark:border-gray-400 dark:hover:bg-gray-400/10 px-6 py-3 lg:py-2.5 rounded-xl font-semibold transition-colors"
              >
                <FilePlus2 className="w-5 h-5" />
                Create Resume
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs md:text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                7 Free Daily
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
              <span>5 Saved Resumes</span>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
              <span>Truthful AI</span>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
              <span>Resets 4 PM BST</span>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-2 w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              <HeroUploadBox />
            </div>
          </div>
        </div>
      </Wrapper>
    </section>
  );
}
