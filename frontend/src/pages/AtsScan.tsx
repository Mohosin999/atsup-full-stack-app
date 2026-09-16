
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Wrapper from "../components/Wrapper";
import { AtsScoreHistory } from "../types";
import AtsScoreResult from "../components/ats-result/AtsScoreResult";
import ResumeScanForm from "../components/ats-scan/ResumeScanForm";
import { clearScanDraft, getScanDraft } from "../utils/scanDraft";

export default function AtsScorePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const pendingDraft = getScanDraft();
  const locationState = location.state as {
    result?: AtsScoreHistory;
    initialResumeFile?: File;
    initialResumeName?: string;
  } | null;
  const stateFile = locationState?.initialResumeFile ?? null;
  const stateName = locationState?.initialResumeName ?? "";

  const [result] = useState<AtsScoreHistory | null>(
    locationState?.result ?? null,
  );
  const [initialResumeFile] = useState<File | null>(
    stateFile ?? pendingDraft?.resumeFile ?? null,
  );
  const [initialResumeName] = useState<string>(
    stateName || pendingDraft?.resumeName || "",
  );
  const [initialJobDescription] = useState<string>(
    pendingDraft?.jobDescription || "",
  );

  useEffect(() => {
    clearScanDraft();
  }, []);

  useEffect(() => {
    if (locationState?.result || locationState?.initialResumeFile) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [locationState, navigate, location.pathname]);

  return (
    <div className="font-plex min-h-screen bg-white dark:bg-stone-950">
      {/* Hero with dot-grid like ResumeDashboard - visible in both light & dark */}
      <section className="relative overflow-hidden pt-8 lg:pt-32 pb-10 md:pb-12">
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
        <Wrapper className="relative">
          <div className="pt-8 lg:pt-0">
            {/* <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex justify-center mb-3"
            >
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-lime-100 text-stone-800 border border-lime-300 dark:bg-lime-400/10 dark:text-lime-200 dark:border-lime-400/20">
                ATS scan
              </span>
            </motion.span> */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="font-fraunces text-2xl md:text-3xl font-normal text-stone-900 text-center mb-4 dark:text-stone-50"
            >
              ATS score check
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="text-sm xl:text-base text-stone-600 text-center max-w-xl xl:max-w-2xl mx-auto dark:text-stone-400"
            >
              Analyze your resume for ATS (Applicant Tracking System)
              compatibility. Get some free AI scans daily for deeper analysis.
            </motion.p>
          </div>
        </Wrapper>
      </section>

      <Wrapper>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 box-shadow"
        >
          <ResumeScanForm
            initialResumeFile={initialResumeFile}
            initialResumeName={initialResumeName}
            initialJobDescription={initialJobDescription}
          />
        </motion.div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-0"
          >
            <AtsScoreResult result={result} />
          </motion.div>
        )}
      </Wrapper>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        .font-fraunces { font-family: 'Fraunces', serif; }
        .font-plex { font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>
    </div>
  );
}