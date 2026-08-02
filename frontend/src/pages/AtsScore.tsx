import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, CheckCircle, XCircle, Scan, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import { atsScoreApi, resumeParserApi, jobApi } from "../api/api";
import { useAppDispatch } from "../hooks/redux";
import { setUserCredits } from "../store/slices/authSlice";
import BackButton from "../components/ui/BackButton";
import ScoreCard from "../components/ui/ScoreCard";
import SectionScoreCard from "../components/SectionScoreCard";
import SuggestionList from "../components/SuggestionList";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import JobMatchBreakdown from "../components/JobMatchBreakdown";
import { AtsScoreHistory, ResumeContent } from "../types";

type Step = "upload" | "jobDescription";

export default function AtsScorePage() {
  const navigate = useNavigate();
  const { id: analysisId } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<Step>("upload");
  const [resumeName, setResumeName] = useState("");
  const [resumeContent, setResumeContent] = useState<ResumeContent | null>(
    null,
  );
  const [jobDescription, setJobDescription] = useState("");
  const [structuredJD, setStructuredJD] = useState<any | null>(null);
  const [parsingJD, setParsingJD] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AtsScoreHistory | null>(null);
  const parseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (analysisId) {
      loadAnalysis(analysisId);
    } else {
      setResult(null);
      setStep("upload");
      setResumeName("");
      setResumeContent(null);
      setJobDescription("");
      setStructuredJD(null);
      setParsingJD(false);
    }
  }, [analysisId]);

  const handleJobDescriptionChange = useCallback((value: string) => {
    setJobDescription(value);

    if (parseTimer.current) clearTimeout(parseTimer.current);

    if (value.trim().length < 20) {
      setStructuredJD(null);
      setParsingJD(false);
      return;
    }

    setParsingJD(true);
    parseTimer.current = setTimeout(async () => {
      try {
        const response = await jobApi.parse(value.trim());
        setStructuredJD(response.data.data);
        console.log("STRUCTURED JD:", response.data.data);
      } catch (error) {
        setStructuredJD(null);
      } finally {
        setParsingJD(false);
      }
    }, 600);
  }, []);

  const loadAnalysis = async (id: string) => {
    setLoading(true);
    try {
      const response = await atsScoreApi.getById(id);
      if (response.data.data) {
        setResult(response.data.data);
        setResumeName(response.data.data.resumeName);
        setResumeContent(response.data.data.resumeContent);
      }
    } catch (error) {
      toast.error("Failed to load analysis");
      navigate("/ats-score");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("resume", file);
      const response = await resumeParserApi.parse(formData);
      console.log("Parsed Resume Data:", response.data.data);
      setResumeName(response.data.data.resumeName);
      setResumeContent(response.data.data.resumeContent);
      setStep("jobDescription");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload resume");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeContent) {
      toast.error("Please upload a resume");
      return;
    }

    try {
      setAnalyzing(true);
      const response = await atsScoreApi.analyze({
        resumeName,
        resumeContent,
        jobDescription: jobDescription.trim() || undefined,
        structuredJD,
      });
      setResult(response.data.data);

      if (response.data.credits !== undefined) {
        dispatch(setUserCredits(response.data.credits));
        toast.success(
          `ATS analysis completed! 1 credit deducted. New balance: ${response.data.credits}`,
        );
      } else {
        toast.success("ATS analysis completed");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to analyze resume");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setStep("upload");
    setResumeName("");
    setResumeContent(null);
    setJobDescription("");
    setStructuredJD(null);
    setParsingJD(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="mt-6 mb-4">
          <BackButton />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            ATS Score Check
          </h1>
          <p className="text-gray-400">
            Analyze your resume for ATS (Applicant Tracking System)
            compatibility
          </p>
        </motion.div>

        {!result ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Step 1: Upload Resume */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`bg-gray-800 rounded-lg p-6 ${step !== "upload" ? "opacity-60" : ""}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === "upload" ? "bg-green-500 text-white" : resumeContent ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-400"}`}
                >
                  {resumeContent ? <CheckCircle className="w-5 h-5" /> : "1"}
                </div>
                <h2 className="text-xl font-semibold text-white">
                  Upload Resume
                </h2>
              </div>

              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {loading ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-400">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF only (MAX. 10MB)
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) await handleFileUpload(file);
                  }}
                />
              </label>

              {resumeContent && (
                <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Selected: {resumeName}</span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Step 2: Job Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`bg-gray-800 rounded-lg p-6 ${step !== "jobDescription" ? "opacity-60" : ""}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === "jobDescription" ? "bg-green-500 text-white" : jobDescription ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-400"}`}
                >
                  {jobDescription ? <CheckCircle className="w-5 h-5" /> : "2"}
                </div>
                <h2 className="text-xl font-semibold text-white">
                  Paste Job Description
                </h2>
              </div>

              <textarea
                value={jobDescription}
                onChange={(e) => handleJobDescriptionChange(e.target.value)}
                placeholder="Paste the job description here (optional, but recommended for better analysis)..."
                rows={10}
                disabled={step !== "jobDescription"}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />

              {parsingJD && (
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                  <LoadingSpinner /> Converting job description to structured
                  format...
                </div>
              )}

              {structuredJD && !parsingJD && (
                <div className="mt-3 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-medium">
                      Structured job description detected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-gray-700 text-green-300 px-2 py-1 rounded">
                      {structuredJD.jobTitle || "Title"}
                    </span>
                    <span className="bg-gray-700 text-green-300 px-2 py-1 rounded">
                      {structuredJD.hardSkills.length} hard skills
                    </span>
                    <span className="bg-gray-700 text-green-300 px-2 py-1 rounded">
                      {structuredJD.softSkills.length} soft skills
                    </span>
                    {structuredJD.actionVerbs?.length > 0 && (
                      <span className="bg-gray-700 text-green-300 px-2 py-1 rounded">
                        {structuredJD.actionVerbs.length} action verbs
                      </span>
                    )}
                    {structuredJD.experienceYearsRequired > 0 && (
                      <span className="bg-gray-700 text-green-300 px-2 py-1 rounded">
                        {structuredJD.experienceYearsRequired}+ yrs
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Scan Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={handleAnalyze}
                disabled={!resumeContent || analyzing}
                className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/25"
              >
                {analyzing ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner /> Scanning...
                  </span>
                ) : (
                  <>
                    <Scan className="w-5 h-5" />
                    Scan Resume
                  </>
                )}
              </button>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="md:col-span-1">
                <ScoreCard
                  score={result.overallScore}
                  label="Overall ATS Score"
                  size="lg"
                  showProgress
                />
              </div>
              <div className="md:col-span-2 bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Summary
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">
                      ATS Friendliness
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {result.atsFriendliness}%
                    </p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">
                      Spelling & Grammar
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {result.spellingGrammar.score}%
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Analyze Another Resume
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold text-white mb-4">
                Section Breakdown
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <SectionScoreCard
                  sectionName="Summary"
                  score={result.sectionScores.summary.score}
                  feedback={result.sectionScores.summary.feedback}
                />
                <SectionScoreCard
                  sectionName="Experience"
                  score={result.sectionScores.experience.score}
                  feedback={result.sectionScores.experience.feedback}
                />
                <SectionScoreCard
                  sectionName="Projects"
                  score={result.sectionScores.projects.score}
                  feedback={result.sectionScores.projects.feedback}
                />
                <SectionScoreCard
                  sectionName="Skills"
                  score={result.sectionScores.skills.score}
                  feedback={result.sectionScores.skills.feedback}
                />
                <SectionScoreCard
                  sectionName="Contact Info"
                  score={result.sectionScores.contactInfo.score}
                  feedback={result.sectionScores.contactInfo.feedback}
                  hasContactInfo={
                    result.sectionScores.contactInfo.hasContactInfo
                  }
                />
                <SectionScoreCard
                  sectionName="Measurable Results"
                  score={
                    result.sectionScores.measurableResults?.score ?? 0
                  }
                  feedback={
                    result.sectionScores.measurableResults?.feedback ??
                    "No measurable result data available."
                  }
                />
              </div>
            </motion.div>

            {result.sectionScores.matchBreakdown && (
              <JobMatchBreakdown
                matchBreakdown={result.sectionScores.matchBreakdown}
              />
            )}

            {result.spellingGrammar.errors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-semibold text-white mb-4">
                  Spelling & Grammar Errors
                </h2>
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="space-y-3">
                    {result.spellingGrammar.errors.map((error, idx) => (
                      <div
                        key={idx}
                        className="bg-red-900/20 border border-red-500/30 rounded-lg p-4"
                      >
                        <div className="flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                          <div>
                            <p className="text-red-400 font-medium">
                              {error.message}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              Suggestion: {error.suggestion}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-white mb-4">
                Improvement Suggestions
              </h2>
              <SuggestionList
                suggestions={result.suggestions}
                title="AI Suggestions"
              />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
