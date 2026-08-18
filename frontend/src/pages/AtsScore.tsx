import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, CheckCircle, X, Calendar, FileText, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { atsScoreApi, unlimitedAtsApi } from "../api/api";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import AnalysisProgressModal, {
  PipelineStep,
} from "../components/ui/AnalysisProgressModal";
import Pagination from "../components/ui/Pagination";
import ConfirmModal from "../components/ui/ConfirmModal";
import Wrapper from "../components/Wrapper";
import { AtsScoreHistory, ResumeContent } from "../types";
import AtsScoreResult from "../components/ats-result/AtsScoreResult";
import ScanActions from "../components/ats-scan/ScanActions";
import { getAiScanStatus } from "../utils/aiScan";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { setUserAiScanState } from "@/store/slices/authSlice";
import { goToLogin } from "../utils/authGuard";

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

export default function AtsScorePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [resumeName, setResumeName] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [pipelineOpen, setPipelineOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState(PIPELINE_MESSAGES[0]);
  const [result, setResult] = useState<AtsScoreHistory | null>(null);
  const [history, setHistory] = useState<AtsScoreHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [clearAllOpen, setClearAllOpen] = useState(false);

  const bothFieldsReady = !!resumeFile && jobDescription.trim().length >= 20;

  const aiScan = getAiScanStatus(user?.subscription);

  const fetchHistory = async (pageNum: number = 1) => {
    try {
      if (!user) {
        setHistoryLoading(false);
        return;
      }
      if (history.length === 0) {
        setHistoryLoading(true);
      }
      const response = await atsScoreApi.getHistory(pageNum, 2);
      setHistory(response.data.data || []);
      setHistoryTotalPages(response.data.pagination?.totalPages || 1);
      setHistoryPage(pageNum);
    } catch {
      // silent fail
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteHistory = async (id: string) => {
    try {
      await atsScoreApi.delete(id);
      toast.success("Deleted successfully");
      fetchHistory(
        history.length === 1 && historyPage > 1 ? historyPage - 1 : historyPage,
      );
    } catch {
      toast.error("Failed to delete");
    }
    setDeleteId(null);
  };

  const handleClearAll = async () => {
    try {
      await atsScoreApi.deleteAll();
      toast.success("All history cleared");
      fetchHistory(1);
    } catch {
      toast.error("Failed to clear history");
    }
    setClearAllOpen(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-violet-400";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-violet-500/20 border-violet-500/30";
    if (score >= 60) return "bg-yellow-500/20 border-yellow-500/30";
    return "bg-red-500/20 border-red-500/30";
  };

  const handleJobDescriptionChange = (value: string) => {
    setJobDescription(value);
  };

  const handleFileUpload = async (file: File) => {
    setResumeFile(file);
    setResumeName(file.name);
  };

  const showMessage = (index: number, delay = 950) =>
    new Promise<void>((resolve) => {
      setCurrentMessage(PIPELINE_MESSAGES[index]);
      window.setTimeout(resolve, delay);
    });

  const handleScan = async () => {
    if (!user) {
      goToLogin(navigate, "/ats-score");
      return;
    }
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

    setPipelineOpen(true);
    setAnalyzing(true);
    setActiveStep(0);
    setCompletedSteps([]);
    setCurrentMessage(PIPELINE_MESSAGES[0]);

    try {
      // Single unlimited ATS check — resume + JD sent together
      setCurrentMessage(PIPELINE_MESSAGES[0]);
      const formData = new FormData();
      formData.append("resume", resumeFile);
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
      setResult(analysisResult);
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
    if (!user) {
      goToLogin(navigate, "/ats-score");
      return;
    }
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
      // Step 1: Parse resume (AI)
      setCurrentMessage(PIPELINE_MESSAGES[0]);
      const formData = new FormData();
      formData.append("resume", resumeFile);
      const parseResponse = await atsScoreApi.parseResume(formData);
      const aiResearch = parseResponse.data.data?.aiResearch;
      if (!aiResearch) {
        throw new Error("AI returned no resume data");
      }

      await showMessage(1);
      setCompletedSteps(["resume"]);
      setActiveStep(1);

      // Step 2: Parse job description (AI)
      setCurrentMessage(PIPELINE_MESSAGES[1]);
      const jdResponse = await atsScoreApi.parseJD(jobDescription.trim());
      const structuredJD = jdResponse.data.data;
      if (!structuredJD) {
        throw new Error("AI returned no job description data");
      }

      await showMessage(2);
      setCompletedSteps(["resume", "jd"]);
      setActiveStep(2);

      // Step 3: Analyze (AI)
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
    <div className="min-h-screen bg-[#F6F9FC] pt-20 pb-12">
      <Wrapper>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="my-8"
        >
          <h1 className="text-lg font-bold text-gray-900 mb-1">
            ATS Score Check
          </h1>
          <p className="text-sm text-gray-600">
            Analyze your resume for ATS (Applicant Tracking System)
            compatibility — unlimited, no credits used
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-6 shadow-[0_0_3px_rgba(0,0,0,0.2)]"
        >
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
                  {loading ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-600 mb-2" />
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF only (MAX. 10MB)
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                </label>
              )}
            </div>

            {/* RIGHT: Job Description */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
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

              <textarea
                value={jobDescription}
                onChange={(e) => handleJobDescriptionChange(e.target.value)}
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

        {/* ATS Score History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-10"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              ATS Score History
            </h2>
            <div className="flex items-center gap-3">
              {history.length > 0 && (
                <>
                  <span className="text-sm text-gray-500">
                    {historyTotalPages} page{historyTotalPages === 1 ? "" : "s"}
                  </span>
                  <button
                    onClick={() => setClearAllOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-600 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </button>
                </>
              )}
            </div>
          </div>

          {historyLoading && history.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <LoadingSpinner />
            </div>
          ) : history.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center text-center py-12 border border-dashed border-gray-200 rounded-2xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-violet-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No ATS Score History
              </h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Your ATS score analyses will appear here once you analyze your
                first resume.
              </p>
            </motion.div>
          ) : (
            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-200 ${
                historyLoading ? "opacity-50" : ""
              }`}
            >
              {history.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:border-violet-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                        {item.resumeName}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div
                          className={`p-3 rounded-lg border ${getScoreBg(item.overallScore)}`}
                        >
                          <p className="text-xs text-gray-600 mb-1">Overall</p>
                          <p
                            className={`text-xl font-bold ${getScoreColor(item.overallScore)}`}
                          >
                            {item.overallScore}%
                          </p>
                        </div>
                        <div
                          className={`p-3 rounded-lg border ${getScoreBg(item.atsFriendliness)}`}
                        >
                          <p className="text-xs text-gray-600 mb-1">
                            ATS Friendly
                          </p>
                          <p
                            className={`text-xl font-bold ${getScoreColor(item.atsFriendliness)}`}
                          >
                            {item.atsFriendliness}%
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <button
                          onClick={() =>
                            navigate(`/ats-score/${item.id}`)
                          }
                          className="px-4 py-2 bg-violet-500/20 border border-violet-500/30 text-violet-500 rounded-lg hover:bg-violet-500/30 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {historyTotalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={historyPage}
                totalPages={historyTotalPages}
                onPageChange={fetchHistory}
              />
            </div>
          )}
        </motion.div>
      </Wrapper>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Entry"
        message="Are you sure you want to delete this ATS score history entry?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => deleteId && handleDeleteHistory(deleteId)}
        onCancel={() => setDeleteId(null)}
        confirmClassName="bg-red-500 hover:bg-red-600"
      />

      <ConfirmModal
        isOpen={clearAllOpen}
        title="Clear All History"
        message="This will permanently delete all your ATS score history. This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        onConfirm={handleClearAll}
        onCancel={() => setClearAllOpen(false)}
        confirmClassName="bg-red-500 hover:bg-red-600"
      />

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
