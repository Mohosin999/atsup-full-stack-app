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
  FileText,
  ShieldCheck,
  Target,
  PencilLine,
  ClipboardPaste,
  Eraser,
  Copy,
} from "lucide-react";
import RewriteProgressModal from "@/components/ui/RewriteProgressModal";
import CreditBadge from "@/components/ui/CreditBadge";
import ActionButton from "@/components/ui/ActionButton";
import { useAppDispatch } from "@/hooks";
import { setUserAiScanState } from "@/store/slices/authSlice";

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
  const dispatch = useAppDispatch();
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
  const progressRef = useRef(0);
  const targetRef = useRef(0);
  const STEP_MILESTONES = [70, 90, 100];

  useEffect(() => {
    const done = completedSteps.length;
    const newTarget = done < STEP_MILESTONES.length ? STEP_MILESTONES[done] : 100;
    targetRef.current = newTarget;
    if (progressRef.current < newTarget) {
      progressRef.current = newTarget;
      setDisplayProgress(newTarget);
    }
  }, [completedSteps.length]);

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
      targetRef.current = 70;
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

    setIsRewriting(true);
    setError(null);
    setPipelineOpen(true);
    setActiveStep(0);
    setCompletedSteps([]);
    setCurrentMessage(REWRITE_MESSAGES[0]);
    setDisplayProgress(0);
    progressRef.current = 0;
    targetRef.current = 70;

    let msgIdx = 0;
    const msgTimer = setInterval(() => {
      msgIdx = Math.min(msgIdx + 1, REWRITE_MESSAGES.length - 1);
      setCurrentMessage(REWRITE_MESSAGES[msgIdx]);
      if (msgIdx === 1) {
        setActiveStep(1);
        setCompletedSteps(["parse"]);
      } else if (msgIdx === 3) {
        setActiveStep(2);
        setCompletedSteps(["parse", "analyze"]);
      }
    }, 2500);

    try {
      const response = await resumeApi.aiRewrite(resumeText, jobDescription);
      const data = response.data?.data;

      if (response.data.aiScan?.lastAiScanResetDate) {
        dispatch(
          setUserAiScanState({
            credits: response.data.aiScan.credits ?? 0,
            lastAiScanResetDate: response.data.aiScan.lastAiScanResetDate,
          }),
        );
      }

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
    <div className="min-h-screen lg:pt-24 pb-16 bg-stone-50 dark:bg-stone-950">
      {/* Hero — homepage language */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(28,25,23,0.35) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <Wrapper className="relative">
          <div className="pt-8 lg:pt-0 pb-10 md:pb-12 lg:pb-16 text-center max-w-3xl mx-auto">
            <span className="font-plex inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-400/10 dark:text-amber-200 dark:border-amber-400/20">
              <Sparkles className="w-3.5 h-3.5" />
              AI-powered resume rewriter
            </span>
            <h1 className="font-fraunces mt-4 text-3xl md:text-4xl lg:text-[2.6rem] font-normal leading-[1.08] text-stone-900 dark:text-stone-50">
              Turn your resume into an{" "}
              <span className="relative inline-block whitespace-nowrap">
                <span className="relative z-10">interview magnet</span>
                <span className="absolute left-0 right-0 bottom-[0.08em] h-[0.32em] bg-lime-300/80 dark:bg-lime-400/70 rounded-[2px] -z-0" />
              </span>
            </h1>
            <p className="font-plex mt-3 text-sm md:text-base leading-relaxed text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              Upload your resume, paste the job description — our AI rewrites it to match the
              role while keeping your experience 100% truthful.
            </p>

            <div className="font-plex mt-6 flex items-center justify-center gap-2 text-xs font-medium">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${resumeText ? "bg-stone-900 dark:bg-lime-300 text-white dark:text-stone-900 border-stone-900 dark:border-lime-300" : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700"}`}
              >
                {resumeText ? <CheckCircle className="w-3.5 h-3.5" /> : "1"} Upload
              </span>
              <span className="w-6 h-px bg-stone-300 dark:bg-stone-700" />
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${jdReady ? "bg-stone-900 dark:bg-lime-300 text-white dark:text-stone-900 border-stone-900 dark:border-lime-300" : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700"}`}
              >
                {jdReady ? <CheckCircle className="w-3.5 h-3.5" /> : "2"} Job details
              </span>
              <span className="w-6 h-px bg-stone-300 dark:bg-stone-700" />
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700">
                3 Rewrite
              </span>
            </div>
          </div>
        </Wrapper>
      </section>

      <Wrapper className="relative">
        {/* Main card */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden">
          <div className="h-1.5 bg-amber-400 dark:bg-amber-300" />
          <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Upload */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${resumeText ? "bg-stone-900 dark:bg-lime-300 text-white dark:text-stone-900" : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"}`}
                >
                  {resumeText ? <CheckCircle className="w-5 h-5" /> : "1"}
                </div>
                <div>
                  <h2 className="font-plex text-base font-semibold text-stone-900 dark:text-stone-100 leading-tight">
                    Upload your resume
                  </h2>
                  <p className="font-plex text-xs text-stone-500 dark:text-stone-400">
                    PDF format, we extract the text automatically
                  </p>
                </div>
              </div>

              {isExtracting ? (
                <div className="font-plex relative min-h-[300px] flex-1 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-amber-300 bg-amber-50/60 dark:bg-amber-400/10 rounded-2xl">
                  <div className="w-10 h-10 border-[3px] border-stone-900 dark:border-lime-300 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                    Extracting text from PDF...
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">This takes a few seconds</p>
                </div>
              ) : resumeText ? (
                <div className="font-plex relative flex-1 min-h-[300px] flex flex-col items-center justify-center gap-3 border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950/40 rounded-2xl p-6">
                  <div className="w-14 h-14 rounded-2xl bg-stone-900 dark:bg-lime-300 flex items-center justify-center shadow">
                    <FileText className="w-7 h-7 text-white dark:text-stone-900" />
                  </div>
                  <p className="text-sm font-semibold text-stone-900 text-center px-4 dark:text-stone-100 break-all">
                    {resumeName || "Resume.pdf"}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {resumeText.length.toLocaleString()} characters extracted
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-1 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" /> Ready to rewrite
                  </span>
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button
                      onClick={clearResume}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-lg transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Replace
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`font-plex relative flex-1 min-h-[300px] flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
                    isDragActive
                      ? "border-stone-900 dark:border-lime-300 bg-amber-50 dark:bg-amber-400/10 scale-[1.01]"
                      : "border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950/40 hover:border-stone-900 dark:hover:border-lime-300 hover:bg-amber-50/60 dark:hover:bg-amber-400/5"
                  }`}
                >
                  <input {...getInputProps()} className="hidden" />
                  <div className="w-14 h-14 rounded-2xl bg-stone-900 dark:bg-lime-300 flex items-center justify-center shadow">
                    <Upload className="w-7 h-7 text-white dark:text-stone-900" />
                  </div>
                  <p className="mt-2 text-sm text-stone-700 dark:text-stone-300">
                    {isDragActive ? (
                      <span className="font-semibold text-stone-900 dark:text-lime-300">Drop your file here</span>
                    ) : (
                      <>
                        <span className="font-semibold text-stone-900 dark:text-lime-300">Click to upload</span> or drag and drop
                      </>
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-stone-900 text-white dark:bg-lime-300 dark:text-stone-900">
                      PDF
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400">Max 5MB</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-2">Your file stays private and secure</p>
                </div>
              )}

              {error && (
                <div className="font-plex bg-red-50 dark:bg-red-500/10 border-l-4 border-red-400 p-4 mt-4 rounded-r-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
            </div>

            {/* Right: Job Description */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${jdReady ? "bg-stone-900 dark:bg-lime-300 text-white dark:text-stone-900" : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"}`}
                  >
                    {jdReady ? <CheckCircle className="w-5 h-5" /> : "2"}
                  </div>
                  <div>
                    <h2 className="font-plex text-base font-semibold text-stone-900 dark:text-stone-100 leading-tight">
                      Job description
                    </h2>
                    <p className="font-plex text-xs text-stone-500 dark:text-stone-400">
                      Paste the role you are targeting
                    </p>
                  </div>
                </div>
                {jdReady && (
                  <span className="font-plex text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-1 rounded-full">
                    {jdWords} words
                  </span>
                )}
              </div>

              <div className="font-plex flex-1 flex flex-col rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950/40 overflow-hidden focus-within:border-stone-900 dark:focus-within:border-lime-300 focus-within:ring-2 focus-within:ring-stone-900/10 dark:focus-within:ring-lime-300/20 transition-all">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job title, requirements, responsibilities here...&#10;&#10;Tip: the more detail you paste, the better the rewrite."
                  className="flex-1 min-h-[260px] w-full bg-transparent p-4 text-sm leading-relaxed text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none resize-none"
                />
                <div className="flex items-center justify-between px-3 py-2 border-t border-stone-200 dark:border-stone-700 bg-white/70 dark:bg-stone-900/70">
                  <span className="text-[11px] text-stone-400">Minimum 20 characters</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePasteJD}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md transition-colors"
                    >
                      <ClipboardPaste className="w-3.5 h-3.5" /> Paste
                    </button>
                    {jobDescription && (
                      <button
                        onClick={() => setJobDescription("")}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md transition-colors"
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
          <div className="font-plex px-6 md:px-8 py-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              AI preserves your real experience — nothing invented.
            </p>
            <div className="flex items-center gap-3">
              <CreditBadge />
              <ActionButton
                label="Rewrite with AI"
                loadingLabel="Rewriting..."
                loading={isRewriting}
                disabled={!resumeText || !jdReady}
                onClick={handleRewrite}
                variant="cyan"
              />
            </div>
          </div>
        </div>

        {/* Parsed preview */}
        {resumeText && (
          <div className="font-plex mt-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-stone-700 dark:text-stone-300" />
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Extracted resume text</h3>
                <span className="text-[11px] text-stone-400">{resumeText.length.toLocaleString()} chars</span>
              </div>
              <button
                onClick={handleCopyResume}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="max-h-[280px] overflow-y-auto">
              <pre className="px-6 py-4 text-[13px] leading-relaxed whitespace-pre-wrap break-words text-stone-700 dark:text-stone-300 font-plex">
                {resumeText}
              </pre>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="font-plex mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
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
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 hover:shadow-lg hover:border-stone-300 dark:hover:border-stone-700 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-400/10 flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5 text-amber-700 dark:text-amber-300" />
              </div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">{f.title}</h3>
              <p className="mt-1 text-[13px] text-stone-500 dark:text-stone-400 leading-relaxed">{f.desc}</p>
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

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        .font-fraunces { font-family: 'Fraunces', serif; }
        .font-plex { font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>
    </div>
  );
}
