import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CheckCircle, X, Upload } from "lucide-react";
import { atsScoreApi } from "../../api/api";
import AnalysisProgressModal, {
  PipelineStep,
} from "../ui/AnalysisProgressModal";
import ActionButton from "../ui/ActionButton";
import { getAiScanStatus } from "../../utils/aiScan";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { setUserAiScanState } from "@/store/slices/authSlice";
import { goToLogin } from "../../utils/authGuard";
import { saveScanDraft } from "../../utils/scanDraft";
import ConfirmModal from "../ui/ConfirmModal";
import CreditBadge from "../ui/CreditBadge";
import {
  MAX_ATS_SCANS,
  OldestInfo,
  limitMessage,
  oldestScanInfo,
} from "../../utils/storageLimits";

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

interface ResumeScanFormProps {
  initialResumeFile?: File | null;
  initialResumeName?: string;
  initialJobDescription?: string;
}

export default function ResumeScanForm({
  initialResumeFile,
  initialResumeName,
  initialJobDescription,
}: ResumeScanFormProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [resumeName, setResumeName] = useState(initialResumeName || "");
  const [resumeFile, setResumeFile] = useState<File | null>(
    initialResumeFile || null,
  );
  const [jobDescription, setJobDescription] = useState(
    initialJobDescription || "",
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [limitInfo, setLimitInfo] = useState<OldestInfo | null>(null);
  const limitAllowRef = useRef(false);
  const [pipelineOpen, setPipelineOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState(PIPELINE_MESSAGES[0]);
  const STEP_MILESTONES = [90, 100];
  const [displayProgress, setDisplayProgress] = useState(0);
  const progressRef = useRef(0);
  const targetRef = useRef(90);

  useEffect(() => {
    const done = completedSteps.length;
    const newTarget = done < STEP_MILESTONES.length ? STEP_MILESTONES[done] : 100;
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

  // Background pre-parse: PDF select হলেই resume LLM parse শুরু (invisible).
  // Click-এর সময় ongoing/done promise reuse হয়, JD parallel-এ join করে।
  const preparseRef = useRef<{ key: string; promise: Promise<any> } | null>(
    null,
  );
  const fileKey = (f: File) => `${f.name}|${f.size}|${f.lastModified}`;
  const startBackgroundResumeParse = (file: File) => {
    if (!user) return;
    const key = fileKey(file);
    if (preparseRef.current?.key === key) return;
    const fd = new FormData();
    fd.append("resume", file);
    const promise = atsScoreApi.parseResume(fd);
    // avoid unhandled rejection if user never clicks scan
    promise.catch(() => {});
    preparseRef.current = { key, promise };
  };

  const bothFieldsReady = !!resumeFile && jobDescription.trim().length >= 20;

  const aiScan = getAiScanStatus(user?.subscription, user?.role);

  const showMessage = (index: number, delay = 150) =>
    new Promise<void>((resolve) => {
      setCurrentMessage(PIPELINE_MESSAGES[index]);
      window.setTimeout(resolve, delay);
    });

  const validate = async () => {
    if (!user) {
      if (resumeFile) {
        await saveScanDraft(resumeFile, resumeName, jobDescription);
      }
      goToLogin(navigate, "/ats-scan");
      return false;
    }
    if (!resumeFile) {
      toast.error("Please upload a resume");
      return false;
    }
    if (jobDescription.trim().length < 20) {
      toast.error(
        "Job description is too short. Please provide at least 20 characters.",
      );
      return false;
    }
    return true;
  };

  const handleLimitSave = () => {
    setLimitInfo(null);
    limitAllowRef.current = true;
    void handleAiScan();
  };

  const handleLimitCancel = () => {
    setLimitInfo(null);
    toast.info('Scan cancelled. Delete an old scan from history to save a new one.');
  };

  const handleAiScan = async () => {
    if (!(await validate())) return;

    // Storage cap gate — before any AI cost. Save replaces oldest, Cancel aborts.
    if (!limitAllowRef.current) {
      try {
        const h = await atsScoreApi.getHistory(1, MAX_ATS_SCANS);
        const total = h.data?.pagination?.total ?? 0;
        if (total >= MAX_ATS_SCANS) {
          const oldest = oldestScanInfo(h.data?.data || []);
          if (oldest) {
            setLimitInfo(oldest);
            return;
          }
        }
      } catch {
        // fail-open: backend still enforces the cap
      }
    }
    const replacing = limitAllowRef.current;
    limitAllowRef.current = false;

    if (!aiScan.available) {
      toast.error("No credit available, wait for next day");
      return;
    }

    setPipelineOpen(true);
    setAnalyzing(true);
    setActiveStep(0);
    setCompletedSteps([]);
    setCurrentMessage(PIPELINE_MESSAGES[0]);
    setDisplayProgress(0);
    progressRef.current = 0;
    targetRef.current = 90;

    try {
      setCurrentMessage(PIPELINE_MESSAGES[0]);
      const key = resumeFile ? fileKey(resumeFile as File) : "";
      let resumePromise: Promise<any>;
      if (preparseRef.current?.key === key) {
        // background parse already running/done — reuse it
        resumePromise = preparseRef.current.promise;
      } else {
        const formData = new FormData();
        formData.append("resume", resumeFile as File);
        resumePromise = atsScoreApi.parseResume(formData);
        preparseRef.current = { key, promise: resumePromise };
      }
      let parseResponse: any;
      let jdResponse: any;
      try {
        [parseResponse, jdResponse] = await Promise.all([
          resumePromise,
          atsScoreApi.parseJD(jobDescription.trim()),
        ]);
      } catch (err: any) {
        // background parse failed (e.g. expired) — retry once fresh
        if (preparseRef.current?.key === key) {
          const formData = new FormData();
          formData.append("resume", resumeFile as File);
          resumePromise = atsScoreApi.parseResume(formData);
          preparseRef.current = { key, promise: resumePromise };
          resumePromise.catch(() => {});
          [parseResponse, jdResponse] = await Promise.all([
            resumePromise,
            atsScoreApi.parseJD(jobDescription.trim()),
          ]);
        } else {
          throw err;
        }
      }
      const aiResearch = parseResponse.data.data?.aiResearch;
      const originalPdf = parseResponse.data.data?.originalPdf;
      if (!aiResearch) {
        throw new Error("AI returned no resume data");
      }

      await showMessage(1);
      setCompletedSteps(["resume"]);
      setActiveStep(1);

      setCurrentMessage(PIPELINE_MESSAGES[1]);
      const structuredJD = jdResponse.data.data;
      if (!structuredJD) {
        throw new Error("AI returned no job description data");
      }

      await showMessage(2);
      setCompletedSteps(["resume", "jd"]);
      setActiveStep(2);

      setCurrentMessage(PIPELINE_MESSAGES[2]);
      const response = await atsScoreApi.analyze({
        resumeName,
        aiResearch,
        jobDescription: jobDescription.trim(),
        structuredJD,
        originalPdf,
      } as any);

      if (response.data.aiScan?.lastAiScanResetDate) {
        dispatch(
          setUserAiScanState({
            credits: response.data.aiScan.credits ?? 0,
            lastAiScanResetDate: response.data.aiScan.lastAiScanResetDate,
          }),
        );
      }

      await showMessage(3, 600);
      setCompletedSteps(["resume", "jd", "ats"]);

      setPipelineOpen(false);
      setAnalyzing(false);

      const score = response.data.data;
      if (replacing) toast.success('Saved. Oldest scan was removed to make space.');
      navigate(`/ats-scan/${score.id}`);
    } catch (error: any) {
      console.error("AI analysis error:", error);
      setPipelineOpen(false);
      setAnalyzing(false);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to analyze with AI",
      );
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        {/* ===============================================================
          * Left: upload resume
         ================================================================*/}
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${resumeFile ? "bg-cyan-500/20 text-cyan-600" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`}
            >
              {resumeFile ? <CheckCircle className="w-5 h-5" /> : "1"}
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Upload Resume
            </h2>
          </div>

          {resumeFile ? (
            <div className="relative min-h-[280px] flex flex-col items-center justify-center border-2 border-dashed border-cyan-400 bg-cyan-50 dark:bg-primary-900 rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-cyan-500" />
                </div>
                <p className="text-sm font-medium text-gray-800 text-center px-4 dark:text-gray-100">
                  {resumeName}
                </p>
              </div>
              <button
                onClick={() => {
                  setResumeFile(null);
                  setResumeName("");
                  preparseRef.current = null;
                }}
                className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-800 hover:bg-red-50 hover:text-red-600 hover:border-red-300 rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          ) : (
            <label className="relative min-h-[280px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-secondary hover:bg-gray-100 dark:hover:bg-primary cursor-pointer rounded-lg">
              <Upload className="w-8 h-8 text-gray-600 dark:text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                PDF only (MAX. 5MB)
              </p>
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error("File too large. Maximum size is 5MB.");
                      e.target.value = "";
                      return;
                    }
                    setResumeFile(file);
                    setResumeName(file.name);
                    startBackgroundResumeParse(file);
                  }
                }}
              />
            </label>
          )}
        </div>

        {/* ===============================================================
          * Right: job description
         ================================================================*/}
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${jobDescription.trim().length >= 20 ? "bg-cyan-500/20 text-cyan-600" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`}
              >
                {jobDescription.trim().length >= 20 ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  "2"
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Paste Job Description
              </h2>
            </div>
          </div>

          <div className="flex-1">
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="flex-1 min-h-[280px] w-full text-sm bg-gray-100 dark:bg-primary border border-gray-300 dark:border-accent rounded-lg p-4 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>
      
      {/* ===============================================================
           * Button
          ================================================================*/}
      <div className="mt-3 flex flex-col sm:flex-row items-center justify-end gap-3">
        <CreditBadge />
        <ActionButton
          label="Scan Now"
          onClick={handleAiScan}
          disabled={!aiScan.available || !bothFieldsReady || analyzing}
          variant="cyan"
        />
      </div>

      <AnalysisProgressModal
        isOpen={pipelineOpen}
        steps={PIPELINE_STEPS}
        activeStep={activeStep}
        completedSteps={completedSteps}
        currentMessage={currentMessage}
        simProgress={displayProgress}
      />

      <ConfirmModal
        isOpen={!!limitInfo}
        title="Storage limit reached"
        message={limitInfo ? limitMessage('scan', limitInfo) : ''}
        confirmText="Save"
        cancelText="Cancel"
        type="warning"
        onConfirm={handleLimitSave}
        onCancel={handleLimitCancel}
      />
    </>
  );
}
