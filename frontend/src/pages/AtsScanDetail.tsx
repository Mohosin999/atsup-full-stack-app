import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Upload, RefreshCw, X, CheckCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { atsScoreApi } from "../api/api";
import { AtsScoreHistory, ResumeContent } from "../types";
import AtsScoreResult from "../components/ats-result/AtsScoreResult";
import AnalysisProgressModal, {
  PipelineStep,
} from "../components/ui/AnalysisProgressModal";
import Wrapper from "../components/Wrapper";
import SkeletonAtsResult from "@/components/ui/SkeletonAtsResult";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { setUserAiScanState } from "@/store/slices/authSlice";
import { getAiScanStatus } from "../utils/aiScan";

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
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const aiScan = getAiScanStatus(user?.subscription, user?.role);

  const {
    data: result,
    isLoading: loading,
    error: queryError,
  } = useQuery<AtsScoreHistory | null>({
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

  const error = !historyId
    ? "No ATS report specified."
    : queryError
      ? (queryError as any)?.response?.data?.message ||
        "Failed to load ATS report."
      : !loading && !result
        ? "ATS report not found."
        : "";

  // Rescan modal state — AI based, 1 credit
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
  const STEP_MILESTONES = [90, 100];
  const [displayProgress, setDisplayProgress] = useState(0);
  const progressRef = useRef(0);
  const targetRef = useRef(90);

  useEffect(() => {
    const done = completedSteps.length;
    const newTarget =
      done < STEP_MILESTONES.length ? STEP_MILESTONES[done] : 100;
    targetRef.current = newTarget;
    if (progressRef.current < newTarget) {
      progressRef.current = newTarget;
      setDisplayProgress(newTarget);
    }
  }, [completedSteps.length]);

  useEffect(() => {
    if (!pipelineOpen) {
      setDisplayProgress(0);
      progressRef.current = 0;
      targetRef.current = 90;
      return;
    }
    const id = setInterval(() => {
      if (progressRef.current < targetRef.current) {
        const next = Math.min(progressRef.current + 3, targetRef.current);
        progressRef.current = next;
        setDisplayProgress(next);
      }
    }, 500);
    return () => clearInterval(id);
  }, [pipelineOpen]);

  // Background pre-parse: rescan modal-এ PDF select হলেই resume LLM parse শুরু (invisible)
  const rescanPreparseRef = useRef<{
    key: string;
    promise: Promise<any>;
  } | null>(null);
  const rescanFileKey = (f: File) => `${f.name}|${f.size}|${f.lastModified}`;
  const startRescanBackgroundParse = (file: File) => {
    if (!user) return;
    const key = rescanFileKey(file);
    if (rescanPreparseRef.current?.key === key) return;
    const fd = new FormData();
    fd.append("resume", file);
    const promise = atsScoreApi.parseResume(fd);
    promise.catch(() => {});
    rescanPreparseRef.current = { key, promise };
  };

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
    if (!aiScan.available) {
      toast.error("No credit available, wait for next day");
      return;
    }

    setRescanOpen(false);
    setPipelineOpen(true);
    setRescanning(true);
    setActiveStep(0);
    setCompletedSteps([]);
    setCurrentMessage(PIPELINE_MESSAGES[0]);
    setDisplayProgress(0);
    progressRef.current = 0;
    targetRef.current = 90;

    try {
      setCurrentMessage(PIPELINE_MESSAGES[0]);
      const rKey = rescanFileKey(resumeFile);
      let resumePromise: Promise<any>;
      if (rescanPreparseRef.current?.key === rKey) {
        resumePromise = rescanPreparseRef.current.promise;
      } else {
        const formData = new FormData();
        formData.append("resume", resumeFile);
        resumePromise = atsScoreApi.parseResume(formData);
        rescanPreparseRef.current = { key: rKey, promise: resumePromise };
      }
      let parseResponse: any;
      let jdResponse: any;
      try {
        [parseResponse, jdResponse] = await Promise.all([
          resumePromise,
          atsScoreApi.parseJD(jobDescription.trim()),
        ]);
      } catch (err: any) {
        const formData = new FormData();
        formData.append("resume", resumeFile);
        resumePromise = atsScoreApi.parseResume(formData);
        rescanPreparseRef.current = { key: rKey, promise: resumePromise };
        resumePromise.catch(() => {});
        [parseResponse, jdResponse] = await Promise.all([
          resumePromise,
          atsScoreApi.parseJD(jobDescription.trim()),
        ]);
      }
      const aiResearch = parseResponse.data.data?.aiResearch;
      const originalPdf = parseResponse.data.data?.originalPdf;
      if (!aiResearch) throw new Error("AI returned no resume data");

      await showMessage(1);
      setCompletedSteps(["resume"]);
      setActiveStep(1);

      setCurrentMessage(PIPELINE_MESSAGES[1]);
      const structuredJD = jdResponse.data.data;
      if (!structuredJD) throw new Error("AI returned no job description data");

      await showMessage(2);
      setCompletedSteps(["resume", "jd"]);
      setActiveStep(2);

      setCurrentMessage(PIPELINE_MESSAGES[2]);
      const response = await atsScoreApi.rescan(historyId, {
        resumeName: resumeName || resumeFile.name,
        aiResearch,
        structuredJD,
        originalPdf,
      } as any);

      // update credits like main scan
      const aiScanData = (response.data as any)?.aiScan;
      if (aiScanData?.lastAiScanResetDate) {
        dispatch(
          setUserAiScanState({
            credits: aiScanData.credits ?? 0,
            lastAiScanResetDate: aiScanData.lastAiScanResetDate,
          }),
        );
      }

      await showMessage(3, 1200);
      setCompletedSteps(["resume", "jd", "ats"]);

      setPipelineOpen(false);
      setRescanning(false);

      const history = (response.data as any)?.data;
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
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      console.error("Rescan error:", error);
      setPipelineOpen(false);
      setRescanning(false);
      toast.error(
        error.response?.data?.message || error.message || "Failed to rescan",
      );
    }
  };

  return (
    <div className="min-h-screen lg:pt-24 pb-12">
      <Wrapper className="!px-4 lg:!px-16">
        {/* Header */}
        <div className="pt-8 lg:pt-0 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-gray-700 dark:text-gray-100">
              ATS Score Report{" "}
              <span className="text-sm font-normal text-gray-600 dark:text-gray-300">
                - {result?.title}
              </span>
            </h1>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center">
            <SkeletonAtsResult />
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
          <AtsScoreResult
            result={result}
            onRescan={() => setRescanOpen(true)}
          />
        ) : null}
      </Wrapper>

      {/* Rescan Modal — AI, 1 credit */}
      {rescanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setRescanOpen(false);
              setResumeFile(null);
              setResumeName("");
              setJobDescription("");
              rescanPreparseRef.current = null;
            }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-secondary">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-cyan-600" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  Rescan Your Resume
                </h2>
              </div>
              <button
                onClick={() => {
                  setRescanOpen(false);
                  setResumeFile(null);
                  setResumeName("");
                  setJobDescription("");
                  rescanPreparseRef.current = null;
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Upload Resume (PDF)
                </label>
                {resumeFile ? (
                  <div className="relative flex items-center gap-3 p-3 border-2 border-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 dark:border-cyan-700 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-800 truncate flex-1 dark:text-gray-100">
                      {resumeName}
                    </p>
                    <button
                      onClick={() => {
                        setResumeFile(null);
                        setResumeName("");
                        rescanPreparseRef.current = null;
                      }}
                      className="text-xs text-red-500 hover:text-red-600 dark:text-red-300 dark:hover:text-red-300/80 font-medium"
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
                          startRescanBackgroundParse(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>

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
                {!aiScan.available && (
                  <p className="mt-2 text-xs md:text-sm text-red-500 dark:text-red-300">
                    0 credits — New quota at 4 PM BST
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => {
                  setRescanOpen(false);
                  setResumeFile(null);
                  setResumeName("");
                  setJobDescription("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:bg-gray-600 dark:hover:bg-gray-600/80 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRescan}
                disabled={
                  !resumeFile ||
                  jobDescription.trim().length < 20 ||
                  rescanning ||
                  !aiScan.available
                }
                className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg  active:scale-105 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Rescan (1 credit)
              </button>
            </div>
          </div>
        </div>
      )}

      <AnalysisProgressModal
        isOpen={pipelineOpen}
        steps={PIPELINE_STEPS}
        activeStep={activeStep}
        completedSteps={completedSteps}
        currentMessage={currentMessage}
        simProgress={displayProgress}
      />
    </div>
  );
}
