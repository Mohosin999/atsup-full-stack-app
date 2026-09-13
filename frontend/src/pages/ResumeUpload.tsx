import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { resumeApi } from "../api/api";
import Wrapper from "@/components/Wrapper";
import { CheckCircle, X, Upload } from "lucide-react";

export default function ResumeUpload() {
  const navigate = useNavigate();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    try {
      const response = await resumeApi.aiRewrite(resumeText, jobDescription);
      const data = response.data?.data;

      // Backend already creates resume and returns id (no need for second create)
      const newResumeId = data?.id;
      if (!newResumeId) {
        throw new Error("Invalid response from AI service");
      }

      navigate(`/resume-builder/${newResumeId}`);
    } catch (err: any) {
      console.error(err);
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

  return (
    <div className="min-h-screen lg:pt-20 pb-12">
      <Wrapper>
        <div className="py-8 lg:mb-4">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800 text-center mb-4 dark:text-gray-100">
            Upload Resume & Rewrite with AI
          </h1>
          <p className="text-sm xl:text-base text-gray-600 text-center max-w-xl xl:max-w-2xl mx-auto dark:text-gray-400">
            Upload your resume (PDF) and paste a job description to generate an
            ATS-optimized resume
          </p>
        </div>

        <div className="bg-white dark:bg-secondary p-6 rounded-lg shadow-[0_0_6px_rgba(0,0,0,0.2)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* Left: Upload Resume */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${resumeText ? "bg-violet-500/20 text-violet-600" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`}
                >
                  {resumeText ? <CheckCircle className="w-5 h-5" /> : "1"}
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  Upload Resume
                </h2>
              </div>

              {isExtracting ? (
                <div className="relative min-h-[280px] flex flex-col items-center justify-center border-2 border-dashed border-violet-400 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-violet-600">Extracting text...</p>
                  </div>
                </div>
              ) : resumeText ? (
                <div className="relative min-h-[280px] flex flex-col items-center justify-center border-2 border-dashed border-violet-400 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-violet-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-800 text-center px-4 dark:text-gray-100">
                      Resume extracted successfully
                    </p>
                  </div>
                  <button
                    onClick={() => setResumeText("")}
                    className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-800 hover:bg-red-50 hover:text-red-600 hover:border-red-300 rounded-lg"
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear
                  </button>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className="relative min-h-[280px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-secondary hover:bg-gray-100 dark:hover:bg-primary cursor-pointer rounded-lg"
                >
                  <input {...getInputProps()} className="hidden" />
                  <Upload className="w-8 h-8 text-gray-600 dark:text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                    PDF only (MAX. 5MB)
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>

            {/* Right: Job Description */}
            <div className="flex flex-col">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${jobDescription.trim().length >= 20 ? "bg-violet-500/20 text-violet-600" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`}
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
                  className="flex-1 min-h-[280px] w-full bg-gray-100 dark:bg-primary border border-gray-300 dark:border-accent rounded-lg p-4 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              onClick={handleRewrite}
              disabled={isRewriting || !resumeText || !jobDescription}
              className="px-6 py-3 text-sm font-semibold bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRewriting ? "Rewriting..." : "Rewrite with AI"}
            </button>
          </div>
        </div>
      </Wrapper>
    </div>
  );
}
