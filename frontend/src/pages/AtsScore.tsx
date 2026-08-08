import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, CheckCircle, X } from "lucide-react";
import { toast } from "react-toastify";
import { atsScoreApi } from "../api/api";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import AnalysisProgressModal, {
  PipelineStep,
} from "../components/ui/AnalysisProgressModal";
import AtsScoreResult from "../components/ats-result/AtsScoreResult";
import { AtsScoreHistory, ResumeContent } from "../types";
import Wrapper from "../components/Wrapper";
import Button from "@/components/ui/Button";
import { useAppDispatch } from "@/hooks";
import { setUserCredits } from "@/store/slices/authSlice";

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
  const [resumeName, setResumeName] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AtsScoreHistory | null>(null);
  const [pipelineOpen, setPipelineOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState(PIPELINE_MESSAGES[0]);

  const bothFieldsReady = !!resumeFile && !!jobDescription.trim();

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

  const handleAnalyze = async () => {
    if (!resumeFile) {
      toast.error("Please upload a resume");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Please paste a job description");
      return;
    }

    setPipelineOpen(true);
    setAnalyzing(true);
    setActiveStep(0);
    setCompletedSteps([]);
    setCurrentMessage(PIPELINE_MESSAGES[0]);

    try {
      // Step 1: Parse resume
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

      // Step 2: Parse job description
      setCurrentMessage(PIPELINE_MESSAGES[1]);
      const jdResponse = await atsScoreApi.parseJD(jobDescription.trim());
      const structuredJD = jdResponse.data.data;
      if (!structuredJD) {
        throw new Error("AI returned no job description data");
      }

      await showMessage(2);
      setCompletedSteps(["resume", "jd"]);
      setActiveStep(2);

      // Step 3: Analyze
      setCurrentMessage(PIPELINE_MESSAGES[2]);
      const response = await atsScoreApi.analyze({
        resumeName,
        aiResearch,
        jobDescription: jobDescription.trim(),
        structuredJD,
      });

      if (response.data.credits !== undefined) {
        dispatch(setUserCredits(response.data.credits));
      }

      await showMessage(3, 1200);
      setCompletedSteps(["resume", "jd", "ats"]);

      const score = response.data.data;
      const analysisResult: AtsScoreHistory = {
        id: score.id,
        _id: score.id,
        userId: "",
        title: score.title || resumeName,
        resumeName,
        overallScore: score.overallScore,
        sectionScores: {
          ...score.sectionScores,
          categories: score.sectionScores?.categories,
          matchBreakdown: score.sectionScores?.matchBreakdown,
        },
        atsFriendliness: score.atsFriendliness,
        suggestions: score.suggestions,
        resumeContent: {} as ResumeContent,
        createdAt: score.createdAt || new Date().toISOString(),
        updatedAt: score.updatedAt || new Date().toISOString(),
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

  const handleReset = () => {
    setResult(null);
    setResumeName("");
    setResumeFile(null);
    setJobDescription("");
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

        {!result ? (
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${jobDescription ? "bg-green-500/20 text-green-600" : "bg-gray-100 text-gray-600"}`}
                  >
                    {jobDescription ? <CheckCircle className="w-5 h-5" /> : "2"}
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
              <Button
                onClick={handleAnalyze}
                disabled={!bothFieldsReady || analyzing}
              >
                Analyze
              </Button>
            </div>
          </motion.div>
        ) : (
          <AtsScoreResult
            result={result}
            headerAction={
              <button
                onClick={handleReset}
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 px-4 rounded-lg transition-colors"
              >
                Analyze Another Resume
              </button>
            }
          />
        )}
      </Wrapper>

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
