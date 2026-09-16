import { Link } from "react-router-dom";
import { ChevronRight, FilePlus2, ScanLine } from "lucide-react";
import Wrapper from "../Wrapper";
import HeroUploadBox from "./HeroUploadBox";

interface HeroSectionProps {
  user: any;
  onLogout: () => void;
}

export default function HeroSection({ user, onLogout }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-stone-950 pt-14 md:pt-20 lg:pt-28 2xl:pt-32 pb-14 md:pb-16 lg:pb-14 xl:pb-16 2xl:pb-20">
      {/* subtle dot-grid texture - visible in both light & dark */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40 dark:hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(28,25,23,0.35) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 hidden dark:block opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(250,250,249,0.5) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <Wrapper>
        <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-8 xl:gap-14 items-center">
          {/* Left Content */}
          <div className="lg:col-span-3 text-center lg:text-left">
            <p className="font-plex text-xs md:text-sm text-stone-500 dark:text-stone-400 mb-4">
              Built for job seekers who'd rather get the interview than guess why they didn't
            </p>

            <h1 className="font-fraunces font-normal text-4xl md:text-5xl lg:text-[2.75rem] xl:text-6xl 2xl:text-[4.2rem] leading-[1.08] text-stone-900 dark:text-stone-50">
              Prepare your resume for the{" "}
              <span className="relative inline-block whitespace-nowrap">
                <span className="relative z-10">ATS screening</span>
                <span className="absolute left-0 right-0 bottom-[0.08em] h-[0.32em] bg-lime-300/80 dark:bg-lime-400/70 rounded-[2px] -z-0" />
              </span>
            </h1>

            <p className="font-plex mt-6 mb-8 text-base xl:text-lg leading-relaxed text-stone-600 dark:text-stone-300 max-w-xl mx-auto lg:mx-0">
              Analyze your resume against any job description and get actionable
              feedback to improve its ATS compatibility. Build an ATS-friendly
              resume, PDF only, that helps you stand out to employers.
            </p>

            <div className="font-plex flex flex-col sm:flex-row justify-center lg:justify-start gap-3 mx-6 sm:mx-0">
              <Link
                to="/ats-scan"
                className="group inline-flex items-center justify-center gap-2 bg-stone-900 dark:bg-lime-300 text-stone-50 dark:text-stone-900 px-6 py-3.5 lg:py-3 rounded-lg text-sm xl:text-base font-medium hover:bg-stone-800 dark:hover:bg-lime-200 transition-colors"
              >
                Scan your resume for free
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/resume-builder"
                className="inline-flex items-center justify-center gap-2 text-sm xl:text-base border border-stone-300 dark:border-stone-700 hover:border-stone-900 dark:hover:border-stone-400 text-stone-800 dark:text-stone-100 px-6 py-3.5 lg:py-3 rounded-lg font-medium transition-colors"
              >
                <FilePlus2 className="w-4 h-4" />
                Create resume
              </Link>
            </div>

            <div className="font-plex mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs md:text-sm text-stone-500 dark:text-stone-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                7 free credits daily
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Resets 4 PM BST
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                100% ATS format score
              </span>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-2 w-full flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {/* decorative scan frame around the real upload box */}
              <div className="absolute -inset-3 rounded-[1.75rem] border border-stone-200 dark:border-stone-800 pointer-events-none" />
              <div className="absolute -top-3 -right-3 z-10 flex items-center gap-1.5 bg-stone-900 dark:bg-lime-300 text-stone-50 dark:text-stone-900 text-xs font-plex font-semibold px-3 py-1.5 rounded-full shadow-lg">
                <ScanLine className="w-3.5 h-3.5" />
                Live scan
              </div>
              <HeroUploadBox />
            </div>
          </div>
        </div>
      </Wrapper>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        .font-fraunces { font-family: 'Fraunces', serif; }
        .font-plex { font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>
    </section>
  );
}