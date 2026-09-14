import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { resumeApi } from "../api/api";
import Wrapper from "@/components/Wrapper";
import {
  CheckCircle,
  X,
  Upload,
  Sparkles,
  ArrowRight,
  FileText,
  ShieldCheck,
  Target,
  PencilLine,
  ClipboardPaste,
  Eraser,
  Copy,
  Loader2,
} from "lucide-react";
import RewriteProgressModal from "@/components/ui/RewriteProgressModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  MAX_RESUMES,
  OldestInfo,
  limitMessage,
  oldestResumeInfo,
} from "../utils/storageLimits";

const REWRITE_STEPS = [
  { id: "parse", label: "Reading" },
  { id: "analyze", label: "Matching" },
  { id: "rewrite", label: "Writing" },
];

const REWRITE_MESSAGES = [
  "Reading your experience...",
  "Matching job keywords...",
  "Writing new summary...",
  "Rewriting bullet points...",
  "Polishing final draft...",
];

export default function ResumeUpload() {
  const navigate = useNavigate();
  const [resumeText, setResumeText] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pipelineOpen, setPipelineOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState(REWRITE_MESSAGES[0]);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [limitInfo, setLimitInfo] = useState<OldestInfo | null>(null);
  const limitAllowRef = useRef(false);
  const progressRef = useRef(0);
  const targetRef = useRef(0);

  const handleLimitSave = () => {
    setLimitInfo(null);
    limitAllowRef.current = true;
    void handleRewrite();
  };

  const handleLimitCancel = () => {
    setLimitInfo(null);
    toast.info('Rewrite cancelled. Delete an old resume from history to save a new one.');
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    setIsExtracting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      // Use backend parser (same as ATS page) - no CDN worker issues
      const response = await resumeApi.parsePdf(formData);
      const text = response.data?.data?.text || response.data?.text;
      if (!text || !text.trim()) {
        throw new Error("No extractable text found in PDF");
      }
      setResumeText(text);
      setResumeName(file.name);
    } catch (err: any) {
      console.error("PDF extraction failed:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to extract text from PDF";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsExtracting(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
  });

  useEffect(() => {
    if (!pipelineOpen) {
      setDisplayProgress(0);
      progressRef.current = 0;
      targetRef.current = 0;
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

  const handleRewrite = async () => {
    if (!resumeText.trim()) {
      toast.error("Please upload a resume PDF first");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Please paste a job description");
      return;
    }

    // Storage cap gate — before any AI cost. Save replaces oldest, Cancel aborts.
    if (!limitAllowRef.current) {
      try {
        const listRes = await resumeApi.getAll(1, MAX_RESUMES);
        const total = listRes.data.pagination?.total ?? 0;
        if (total >= MAX_RESUMES) {
          const oldest = oldestResumeInfo(listRes.data.data || []);
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

    setIsRewriting(true);
    setError(null);
    setPipelineOpen(true);
    setActiveStep(0);
    setCompletedSteps([]);
    setCurrentMessage(REWRITE_MESSAGES[0]);
    setDisplayProgress(0);
    progressRef.current = 0;
    targetRef.current = 90;

    let msgIdx = 0;
    const msgTimer = setInterval(() => {
      msgIdx = Math.min(msgIdx + 1, REWRITE_MESSAGES.length - 1);
      setCurrentMessage(REWRITE_MESSAGES[msgIdx]);
      const stepIdx = Math.min(msgIdx, REWRITE_STEPS.length - 1);
      setActiveStep(stepIdx);
      setCompletedSteps(REWRITE_STEPS.slice(0, msgIdx).map((s) => s.id));
    }, 2500);

    try {
      const response = await resumeApi.aiRewrite(resumeText, jobDescription);
      const data = response.data?.data;

      const newResumeId = data?.id;
      if (!newResumeId) {
        throw new Error("Invalid response from AI service");
      }

      clearInterval(msgTimer);
      setActiveStep(REWRITE_STEPS.length - 1);
      setCompletedSteps(REWRITE_STEPS.map((s) => s.id));
      setCurrentMessage(REWRITE_MESSAGES[REWRITE_MESSAGES.length - 1]);
      targetRef.current = 100;
      setDisplayProgress(100);

      if (replacing) toast.success('Saved. Oldest resume was removed to make space.');
      setTimeout(() => {
        setPipelineOpen(false);
        navigate(`/resume-builder/${newResumeId}`);
      }, 800);
    } catch (err: any) {
      clearInterval(msgTimer);
      console.error(err);
      setPipelineOpen(false);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to rewrite resume";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsRewriting(false);
    }
  };

  const handlePasteJD = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      setJobDescription((prev) => (prev ? `${prev}\n${text}` : text));
    } catch {
      toast.error("Could not read clipboard");
    }
  };

  const handleCopyResume = async () => {
    try {
      await navigator.clipboard.writeText(resumeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy text");
    }
  };

  const clearResume = () => {
    setResumeText("");
    setResumeName("");
  };

  const jdReady = jobDescription.trim().length >= 20;
  const jdWords = jobDescription.trim()
    ? jobDescription.trim().split(/\s+/).length
    : 0;

  return (
    <div className="min-h-screen lg:pt-20 pb-16 bg-gradient-to-b from-violet-50/70 via-white to-white dark:from-violet-950/20 dark:via-background dark:to-background">
      <Wrapper>
        {/* Hero */}
        <div className="py-10 text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 border border-violet-200 dark:border-violet-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Resume Rewriter
          </span>
          <h1 className="mt-4 text-2xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Turn your resume into an{" "}
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
              interview magnet
            </span>
          </h1>
          <p className="mt-3 text-sm md:text-base text-gray-600 dark:text-gray-400">
            Upload your resume, paste the job description — our AI rewrites it
            to match the role while keeping your experience 100% truthful.
          </p>

          {/* mini stepper */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${resumeText ? "bg-violet-600 text-white border-violet-600" : "bg-white dark:bg-secondary text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"}`}
            >
              {resumeText ? <CheckCircle className="w-3.5 h-3.5" /> : "1"} Upload
            </span>
            <span className="w-6 h-px bg-gray-300 dark:bg-gray-700" />
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${jdReady ? "bg-violet-600 text-white border-violet-600" : "bg-white dark:bg-secondary text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"}`}
            >
              {jdReady ? <CheckCircle className="w-3.5 h-3.5" /> : "2"} Job details
            </span>
            <span className="w-6 h-px bg-gray-300 dark:bg-gray-700" />
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-white dark:bg-secondary text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700">
              3 Rewrite
            </span>
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white dark:bg-secondary rounded-2xl border border-gray-200 dark:border-gray-800 shadow-[0_20px_60px_-20px_rgba(124,58,237,0.25)] overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
          <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Upload */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${resumeText ? "bg-violet-600 text-white" : "bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-300"}`}
                >
                  {resumeText ? <CheckCircle className="w-5 h-5" /> : "1"}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                    Upload your resume
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF format, we extract the text automatically
                  </p>
                </div>
              </div>

              {isExtracting ? (
                <div className="relative min-h-[300px] flex-1 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-violet-400 bg-violet-50/60 dark:bg-violet-500/10 rounded-2xl">
                  <div className="w-10 h-10 border-[3px] border-violet-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-medium text-violet-700 dark:text-violet-300">
                    Extracting text from PDF...
                  </p>
                  <p className="text-xs text-gray-500">This takes a few seconds</p>
                </div>
              ) : resumeText ? (
                <div className="relative flex-1 min-h-[300px] flex flex-col items-center justify-center gap-3 border-2 border-solid border-violet-200 dark:border-violet-500/30 bg-gradient-to-b from-violet-50 to-white dark:from-violet-500/10 dark:to-transparent rounded-2xl p-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 text-center px-4 dark:text-gray-100 break-all">
                    {resumeName || "Resume.pdf"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {resumeText.length.toLocaleString()} characters extracted
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" /> Ready to rewrite
                  </span>
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button
                      onClick={clearResume}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-lg transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Replace
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`relative flex-1 min-h-[300px] flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
                    isDragActive
                      ? "border-violet-500 bg-violet-50 dark:bg-violet-500/15 scale-[1.01]"
                      : "border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-primary/40 hover:border-violet-400 hover:bg-violet-50/60 dark:hover:bg-violet-500/10"
                  }`}
                >
                  <input {...getInputProps()} className="hidden" />
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <Upload className="w-7 h-7 text-white" />
                  </div>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    {isDragActive ? (
                      <span className="font-semibold text-violet-600">
                        Drop your file here
                      </span>
                    ) : (
                      <>
                        <span className="font-semibold text-violet-600">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </>
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-gray-900 text-white dark:bg-white dark:text-gray-900">
                      PDF
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Max 5MB
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2">
                    Your file stays private and secure
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border-l-4 border-red-400 p-4 mt-4 rounded-r-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
            </div>

            {/* Right: Job Description */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${jdReady ? "bg-violet-600 text-white" : "bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-300"}`}
                  >
                    {jdReady ? <CheckCircle className="w-5 h-5" /> : "2"}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                      Job description
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Paste the role you are targeting
                    </p>
                  </div>
                </div>
                {jdReady && (
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    {jdWords} words
                  </span>
                )}
              </div>

              <div className="flex-1 flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-primary/40 overflow-hidden focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job title, requirements, responsibilities here...&#10;&#10;Tip: the more detail you paste, the better the rewrite."
                  className="flex-1 min-h-[260px] w-full bg-transparent p-4 text-sm leading-relaxed text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none resize-none"
                />
                <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-secondary/70">
                  <span className="text-[11px] text-gray-400">
                    Minimum 20 characters
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePasteJD}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-md transition-colors"
                    >
                      <ClipboardPaste className="w-3.5 h-3.5" /> Paste
                    </button>
                    {jobDescription && (
                      <button
                        onClick={() => setJobDescription("")}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <Eraser className="w-3.5 h-3.5" /> Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 md:px-8 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-primary/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              AI preserves your real experience — nothing invented.
            </p>
            <button
              onClick={handleRewrite}
              disabled={isRewriting || !resumeText || !jdReady}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 shadow-lg shadow-violet-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isRewriting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Rewriting...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Rewrite with AI
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Parsed preview */}
        {resumeText && (
          <div className="mt-6 bg-white dark:bg-secondary rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-violet-500" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Extracted resume text
                </h3>
                <span className="text-[11px] text-gray-400">
                  {resumeText.length.toLocaleString()} chars
                </span>
              </div>
              <button
                onClick={handleCopyResume}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="max-h-[280px] overflow-y-auto">
              <pre className="px-6 py-4 text-[13px] leading-relaxed whitespace-pre-wrap break-words text-gray-700 dark:text-gray-300 font-sans">
                {resumeText}
              </pre>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Target,
              title: "Tailored to the role",
              desc: "Keywords and requirements from the JD woven naturally into your resume.",
            },
            {
              icon: ShieldCheck,
              title: "Truthful, never invented",
              desc: "Your real experience stays intact — AI only improves wording and focus.",
            },
            {
              icon: PencilLine,
              title: "Review & perfect it",
              desc: "The rewrite opens in the builder where you can edit and download as PDF.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white dark:bg-secondary rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-500/30 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5 text-violet-600 dark:text-violet-300" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {f.title}
              </h3>
              <p className="mt-1 text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </Wrapper>

      <RewriteProgressModal
        isOpen={pipelineOpen}
        steps={REWRITE_STEPS}
        activeStep={activeStep}
        completedSteps={completedSteps}
        currentMessage={currentMessage}
        simProgress={displayProgress}
      />

      <ConfirmModal
        isOpen={!!limitInfo}
        title="Storage limit reached"
        message={limitInfo ? limitMessage('resume', limitInfo) : ''}
        confirmText="Save"
        cancelText="Cancel"
        type="warning"
        onConfirm={handleLimitSave}
        onCancel={handleLimitCancel}
      />
    </div>
  );
}
