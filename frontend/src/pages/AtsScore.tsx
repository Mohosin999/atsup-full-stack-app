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
    <div className="min-h-screen lg:pt-20 pb-12">
      <Wrapper>
        <div className="py-8 lg:mb-4">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800 text-center mb-4 dark:text-gray-100">
            ATS Score Check
          </h1>
          <p className="text-sm xl:text-base text-gray-600 text-center max-w-xl xl:max-w-2xl mx-auto dark:text-gray-400">
            Analyze your resume for ATS (Applicant Tracking System)
            compatibility. You can use this service unlimited, no credits used
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-[0_0_6px_rgba(0,0,0,0.2)] dark:bg-gray-800"
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
            className="my-8"
          >
            <AtsScoreResult result={result} />
          </motion.div>
        )}
      </Wrapper>
    </div>
  );
}
