import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CheckCircle, X, Upload } from "lucide-react";
import { atsScoreApi, unlimitedAtsApi } from "../../api/api";
import AnalysisProgressModal, {
  PipelineStep,
} from "../ui/AnalysisProgressModal";
import ScanActions from "./ScanActions";
import { AtsScoreHistory, ResumeContent } from "../../types";
import { demoJds } from "../../constants/demoJds";
import { getAiScanStatus } from "../../utils/aiScan";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { setUserAiScanState } from "@/store/slices/authSlice";
import { goToLogin } from "../../utils/authGuard";
import { saveScanDraft } from "../../utils/scanDraft";

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
  const [demoJdSelected, setDemoJdSelected] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [pipelineOpen, setPipelineOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState(PIPELINE_MESSAGES[0]);

  const bothFieldsReady = !!resumeFile && jobDescription.trim().length >= 20;

  const aiScan = getAiScanStatus(user?.subscription);

  const showMessage = (index: number, delay = 950) =>
    new Promise<void>((resolve) => {
      setCurrentMessage(PIPELINE_MESSAGES[index]);
      window.setTimeout(resolve, delay);
    });

  const validate = async () => {
    if (!user) {
      if (resumeFile) {
        await saveScanDraft(resumeFile, resumeName, jobDescription);
      }
      goToLogin(navigate, "/ats-score");
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

  const handleScan = async () => {
    if (!(await validate())) return;

    setPipelineOpen(true);
    setAnalyzing(true);
    setActiveStep(0);
    setCompletedSteps([]);
    setCurrentMessage(PIPELINE_MESSAGES[0]);

    try {
      setCurrentMessage(PIPELINE_MESSAGES[0]);
      const formData = new FormData();
      formData.append("resume", resumeFile as File);
      formData.append("resumeName", resumeName);
      formData.append("jobDescription", jobDescription.trim());
      const response = await unlimitedAtsApi.analyze(formData);

      const data = response.data.data;
      const score = data?.score;
      if (!score) {
        throw new Error("AI returned no ATS score");
      }

      await showMessage(1);
      setCompletedSteps(["resume"]);
      setActiveStep(1);

      await showMessage(2);
      setCompletedSteps(["resume", "jd"]);
      setActiveStep(2);

      setCurrentMessage(PIPELINE_MESSAGES[2]);
      await showMessage(3, 1200);
      setCompletedSteps(["resume", "jd", "ats"]);

      setPipelineOpen(false);
      setAnalyzing(false);

      if (data.history?.id) {
        navigate(`/ats-score/${data.history.id}`);
        return;
      }

      const analysisResult: AtsScoreHistory = {
        id: "",
        _id: "",
        userId: "",
        title: `${resumeName} — ATS Report`,
        resumeName,
        overallScore: score.overallScore,
        sectionScores: {
          ...score.sectionScores,
          categories: score.categories,
          matchBreakdown: score.matchBreakdown,
        },
        atsFriendliness: score.atsFriendliness,
        suggestions: score.suggestions,
        resumeContent: (data.resume || {}) as ResumeContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setPipelineOpen(false);
      setAnalyzing(false);
      navigate("/ats-score", { state: { result: analysisResult } });
    } catch (error: any) {
      console.error("Analysis error:", error);
      setPipelineOpen(false);
      setAnalyzing(false);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to analyze resume",
      );
    }
  };

  const handleAiScan = async () => {
    if (!(await validate())) return;

    if (!aiScan.available) {
      toast.error("No credit available, wait for next day");
      return;
    }

    setPipelineOpen(true);
    setAnalyzing(true);
    setActiveStep(0);
    setCompletedSteps([]);
    setCurrentMessage(PIPELINE_MESSAGES[0]);

    try {
      setCurrentMessage(PIPELINE_MESSAGES[0]);
      const formData = new FormData();
      formData.append("resume", resumeFile as File);
      const parseResponse = await atsScoreApi.parseResume(formData);
      const aiResearch = parseResponse.data.data?.aiResearch;
      if (!aiResearch) {
        throw new Error("AI returned no resume data");
      }

      await showMessage(1);
      setCompletedSteps(["resume"]);
      setActiveStep(1);

      setCurrentMessage(PIPELINE_MESSAGES[1]);
      const jdResponse = await atsScoreApi.parseJD(jobDescription.trim());
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
      });

      if (response.data.aiScan?.lastAiScanResetDate) {
        dispatch(
          setUserAiScanState({
            credits: response.data.aiScan.credits ?? 0,
            lastAiScanResetDate: response.data.aiScan.lastAiScanResetDate,
          }),
        );
      }

      await showMessage(3, 1200);
      setCompletedSteps(["resume", "jd", "ats"]);

      setPipelineOpen(false);
      setAnalyzing(false);

      const score = response.data.data;
      navigate(`/ats-score/${score.id}`);
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
        {/* LEFT: Upload Resume */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${resumeFile ? "bg-green-500/20 text-green-600" : "bg-gray-100 text-gray-600"}`}
            >
              {resumeFile ? <CheckCircle className="w-5 h-5" /> : "1"}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Upload Resume
            </h2>
          </div>

          {resumeFile ? (
            <div className="relative flex-1 min-h-[280px] flex flex-col items-center justify-center border-2 border-dashed border-green-400 bg-green-50 rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-sm font-medium text-gray-900 text-center px-4">
                  {resumeName}
                </p>
              </div>
              <button
                onClick={() => {
                  setResumeFile(null);
                  setResumeName("");
                }}
                className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300 rounded-lg transition-colors shadow-sm"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          ) : (
            <label className="relative flex-1 min-h-[280px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 bg-white hover:bg-gray-100 cursor-pointer rounded-lg transition-colors">
              <Upload className="w-8 h-8 text-gray-600 mb-2" />
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF only (MAX. 10MB)
              </p>
              <input
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

        {/* RIGHT: Job Description */}
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${jobDescription.trim().length >= 20 ? "bg-green-500/20 text-green-600" : "bg-gray-100 text-gray-600"}`}
              >
                {jobDescription.trim().length >= 20 ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  "2"
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Paste Job Description
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 whitespace-nowrap">
                Demo JD
              </span>
              <select
                value={demoJdSelected}
                onChange={(e) => {
                  const selected = demoJds.find(
                    (d) => d.label === e.target.value,
                  );
                  setDemoJdSelected(e.target.value);
                  if (selected) setJobDescription(selected.description);
                }}
                className="text-sm bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select role</option>
                {demoJds.map((d) => (
                  <option key={d.label} value={d.label}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            className="flex-1 min-h-[280px] w-full bg-gray-100 border border-gray-300 rounded-lg p-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <ScanActions
          aiScanAvailable={aiScan.available}
          aiScanDisabled={!bothFieldsReady || analyzing}
          aiScanLoading={analyzing}
          scanDisabled={!bothFieldsReady || analyzing}
          scanLoading={analyzing}
          onAiScan={handleAiScan}
          onScan={handleScan}
        />
      </div>

      <AnalysisProgressModal
        isOpen={pipelineOpen}
        steps={PIPELINE_STEPS}
        activeStep={activeStep}
        completedSteps={completedSteps}
        currentMessage={currentMessage}
      />
    </>
  );
}
