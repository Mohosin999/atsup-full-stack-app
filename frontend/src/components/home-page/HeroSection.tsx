import { Link } from "react-router-dom";
import { ChevronRight, FilePlus2 } from "lucide-react";
import Wrapper from "../Wrapper";

interface HeroSectionProps {
  user: any;
  onLogout: () => void;
}

export default function HeroSection({ user, onLogout }: HeroSectionProps) {
  return (
    <section className="pt-10 md:pt-14 lg:pt-6 xl:pt-16 2xl:pt-20 pb-0 md:pb-4 lg:pb-0 xl:pb-10 2xl:pb-16 text-center lg:text-start">
      <Wrapper>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-10 items-center">
          {/* Left Content - 2/3 */}
          <div className="lg:col-span-2 text-center lg:text-start">
            {/* Heading */}
            <div className="text-4xl md:text-5xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-gray-800 dark:text-gray-100 md:space-y-3 xl:space-y-4">
              <h1>Prepare your resume for</h1>

              <h1>
                the{" "}
                <span className="relative inline-block px-1">
                  <span className="relative z-10 text-gray-800 dark:text-gray-100">
                    ATS screening
                  </span>

                  {/* Marker Effect */}
                  <span className="absolute left-0 right-0 bottom-1 h-8 md:h-10 lg:h-8 xl:h-10 2xl:h-12 bg-cyan-200/80 dark:bg-secondary rounded-sm -z-0" />
                </span>
              </h1>
            </div>

            {/* Description */}
            <p className="my-8 lg:my-6 xl:my-8 text-base xl:text-lg text-gray-700 dark:text-gray-300 max-w-xl mx-auto lg:mx-0">
              Analyze your resume against software engineering job descriptions
              and get actionable feedback to improve its ATS compatibility.
              Build an ATS-friendly resume (PDF only) that helps you stand out
              to employers.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mx-6 md:mx-0">
              <Link
                to="/ats-scan"
                className="group flex items-center justify-center bg-cyan-600 text-white px-6 py-3 lg:py-2 rounded-lg text-sm xl:text-lg gap-2 font-medium hover:bg-cyan-600/90"
              >
                Scan Your Resume for Free
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/resume-builder"
                className="flex items-center justify-center gap-2 text-sm xl:text-lg border-2 border-gray-600 hover:bg-gray-600/10 dark:border-gray-400 dark:hover:bg-gray-400/10 px-6 py-3 lg:py-2 rounded-lg"
              >
                <FilePlus2 className="w-5 h-5" />
                Create Resume
              </Link>
            </div>
          </div>

          {/* Right Content - 1/3 */}
          <div className="lg:col-span-1 w-full flex justify-center lg:justify-end">
            <img
              src="/favicon.png"
              alt="ats-up"
              className="w-[420px] h-[420px] object-contain"
            />
          </div>
        </div>
      </Wrapper>
    </section>
  );
}
