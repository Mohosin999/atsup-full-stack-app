import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Eye, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Wrapper from "../components/Wrapper";
import { AtsScoreHistory } from "../types";
import AtsScoreResult from "../components/ats-result/AtsScoreResult";
import ResumeScanForm from "../components/ats-scan/ResumeScanForm";
import { clearScanDraft, getScanDraft } from "../utils/scanDraft";
import { atsScoreApi } from "../api/api";
import { useAppSelector } from "@/hooks";

export default function AtsScorePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
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

  const { data: recentScans = [] } = useQuery<AtsScoreHistory[]>({
    queryKey: ["ats-recent-scans", user?._id],
    queryFn: async () => {
      if (!user) return [];
      const res = await atsScoreApi.getHistory(1, 3);
      return res.data.data || [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    clearScanDraft();
  }, []);

  useEffect(() => {
    if (locationState?.result || locationState?.initialResumeFile) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [locationState, navigate, location.pathname]);

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen bg-[#F6F9FC] pb-12">
      <Wrapper>
        <div className="my-8">
          <h1 className="text-lg font-bold text-gray-800 mb-1">
            ATS Score Check
          </h1>
          <p className="text-sm text-gray-600">
            Analyze your resume for ATS (Applicant Tracking System)
            compatibility — unlimited, no credits used
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 shadow-[0_0_3px_rgba(0,0,0,0.2)]"
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

        {user && recentScans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <div className="bg-white border border-gray-300 overflow-hidden">
              <div className="px-5 py-3 bg-[#A5D9FC] border-b border-gray-300">
                <h2 className="text-sm font-semibold text-gray-800">Recent Scans</h2>
              </div>
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between px-5 py-3 border-b border-gray-200 last:border-b-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-700 truncate">{scan.resumeName}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(scan.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-semibold ${getScoreColor(scan.overallScore)}`}>
                      {scan.overallScore}%
                    </span>
                    <button
                      onClick={() => navigate(`/ats-scan/${scan.id}`)}
                      className="text-gray-400 hover:text-cyan-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/scan-history")}
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-cyan-600 hover:text-cyan-700 transition-colors"
            >
              See More
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </Wrapper>
    </div>
  );
}
