import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Upload,
  RefreshCw,
  X,
  CheckCircle,
  FileText,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { atsScoreApi, unlimitedAtsApi } from "../api/api";
import { AtsScoreHistory, ResumeContent } from "../types";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import AtsScoreResult from "../components/ats-result/AtsScoreResult";
import AnalysisProgressModal, {
  PipelineStep,
} from "../components/ui/AnalysisProgressModal";
import Wrapper from "../components/Wrapper";

const PIPELINE_STEPS: PipelineStep[] = [
  { id: "resume", label: "Resume Analysis" },
  { id: "jd", label: "Job Description Analysis" },
  { id: "ats", label: "ATS Score Calculation" },
];

const PIPELINE_MESSAGES = [
  "Sending resume & job description...",
  "Extracting resume data...",
  "Parsing job description...",
  "Calculating ATS score...",
  "Analysis complete!",
];

export default function AtsScoreDetail() {
  const navigate = useNavigate();
  const { id: historyId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: result, isLoading: loading, error: queryError } = useQuery<AtsScoreHistory | null>({
    queryKey: ["ats-report", historyId],
    queryFn: async () => {
      if (!historyId) return null;
      const res = await atsScoreApi.getById(historyId);
      const score = res.data?.data;
      if (!score) return null;
      return {
        id: score.id,
        _id: score.id,
        userId: score.userId || "",
        title: score.title,
        resumeName: score.resumeName,
        overallScore: score.overallScore,
        sectionScores: {
          ...score.sectionScores,
          categories: score.sectionScores?.categories,
          matchBreakdown: score.sectionScores?.matchBreakdown,
        },
        atsFriendliness: score.atsFriendliness,
        suggestions: score.suggestions,
        resumeContent: score.resumeContent || ({} as ResumeContent),
        createdAt: score.createdAt || new Date().toISOString(),
        updatedAt: score.updatedAt || new Date().toISOString(),
      };
    },
    enabled: !!historyId,
  });

  const error = !historyId ? "No ATS report specified." : queryError ? (queryError as any)?.response?.data?.message || "Failed to load ATS report." : !loading && !result ? "ATS report not found." : "";

  // Rescan modal state
  const [rescanOpen, setRescanOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeName, setResumeName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [rescanning, setRescanning] = useState(false);
  const [pipelineOpen, setPipelineOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState(PIPELINE_MESSAGES[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showMessage = (index: number, delay = 950) =>
    new Promise<void>((resolve) => {
      setCurrentMessage(PIPELINE_MESSAGES[index]);
      window.setTimeout(resolve, delay);
    });

  const handleRescan = async () => {
    if (!resumeFile) {
      toast.error("Please upload a resume");
      return;
    }
    if (jobDescription.trim().length < 20) {
      toast.error(
        "Job description is too short. Please provide at least 20 characters.",
      );
      return;
    }
    if (!historyId) return;

    setRescanOpen(false);
    setPipelineOpen(true);
    setRescanning(true);
    setActiveStep(0);
    setCompletedSteps([]);
    setCurrentMessage(PIPELINE_MESSAGES[0]);

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("resumeName", resumeName || resumeFile.name);
      formData.append("jobDescription", jobDescription.trim());

      await showMessage(0);
      setCompletedSteps(["resume"]);
      setActiveStep(1);

      await showMessage(1);
      setCompletedSteps(["resume", "jd"]);
      setActiveStep(2);

      await showMessage(2);

      const response = await unlimitedAtsApi.rescan(historyId, formData);

      const data = response.data.data;
      const history = data?.history;

      await showMessage(3, 1200);
      setCompletedSteps(["resume", "jd", "ats"]);

      setPipelineOpen(false);
      setRescanning(false);

      if (history) {
        const updated: AtsScoreHistory = {
          id: history.id,
          _id: history.id,
          userId: history.userId || "",
          title: history.title,
          resumeName: history.resumeName,
          overallScore: history.overallScore,
          sectionScores: {
            ...history.sectionScores,
            categories: history.sectionScores?.categories,
            matchBreakdown: history.sectionScores?.matchBreakdown,
          },
          atsFriendliness: history.atsFriendliness,
          suggestions: history.suggestions,
          resumeContent: history.resumeContent || ({} as ResumeContent),
          createdAt: history.createdAt || new Date().toISOString(),
          updatedAt: history.updatedAt || new Date().toISOString(),
        };
        queryClient.setQueryData(["ats-report", historyId], updated);
        queryClient.invalidateQueries({ queryKey: ["ats-history"] });
      }

      setResumeFile(null);
      setResumeName("");
      setJobDescription("");
      toast.success("Rescan completed successfully");
    } catch (error: any) {
      console.error("Rescan error:", error);
      setPipelineOpen(false);
      setRescanning(false);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to rescan",
      );
    }
  };

  return (
    <div className="min-h-screen lg:pt-24 pb-12">
      <Wrapper className="!px-4 lg:!px-16">
        {/* Header */}
        <div className="pt-8 lg:pt-0 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-gray-700">
              ATS Score Report{" "}
              <span className="text-sm font-normal text-gray-600">
                - {result?.title}
              </span>
            </h1>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <LoadingSpinner />
          </div>
        ) : error ? (
            <div className="bg-white rounded-lg p-8 text-center dark:bg-gray-800">
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button
              onClick={() => navigate("/ats-scan")}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
            >
              Go to ATS Score
            </button>
          </div>
        ) : result ? (
          <AtsScoreResult result={result} onRescan={() => setRescanOpen(true)} />
        ) : null}
      </Wrapper>

      {/* ============================================================
          Rescan Modal
      ============================================================ */}
      {rescanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setRescanOpen(false);
              setResumeFile(null);
              setResumeName("");
              setJobDescription("");
            }}
          />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800">
            {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-cyan-600" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  Rescan Resume
                </h2>
              </div>
              <button
                onClick={() => {
                  setRescanOpen(false);
                  setResumeFile(null);
                  setResumeName("");
                  setJobDescription("");
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Upload Resume */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Upload Resume (PDF)
                </label>
                {resumeFile ? (
                  <div className="relative flex items-center gap-3 p-3 border-2 border-cyan-400 bg-cyan-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-6 h-6 text-cyan-500" />
                    </div>
                      <p className="text-sm font-medium text-gray-800 truncate flex-1 dark:text-gray-100">
                      {resumeName}
                    </p>
                    <button
                      onClick={() => {
                        setResumeFile(null);
                        setResumeName("");
                      }}
                      className="text-xs text-red-500 hover:text-red-600 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors p-6 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:bg-gray-700">
                    <Upload className="w-8 h-8 text-gray-400 mb-2 dark:text-gray-500" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-semibold text-cyan-600">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </p>
                      <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                      PDF only (MAX. 10MB)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setResumeFile(file);
                          setResumeName(file.name);
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Job Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  rows={8}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setRescanOpen(false);
                  setResumeFile(null);
                  setResumeName("");
                  setJobDescription("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRescan}
                disabled={
                  !resumeFile || jobDescription.trim().length < 20 || rescanning
                }
                className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Rescan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Progress Modal */}
      <AnalysisProgressModal
        isOpen={pipelineOpen}
        steps={PIPELINE_STEPS}
        activeStep={activeStep}
        completedSteps={completedSteps}
        currentMessage={currentMessage}
      />
    </div>
  );
}
