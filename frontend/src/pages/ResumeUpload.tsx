import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { resumeApi } from "../api/api";

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
      toast.success("Resume extracted successfully");
    } catch (err: any) {
      console.error("PDF extraction failed:", err);
      const msg = err.response?.data?.message || err.message || "Failed to extract text from PDF";
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

      toast.success("Resume rewritten successfully");
      navigate(`/resume-builder/${newResumeId}`);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Failed to rewrite resume";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsRewriting(false);
    }
  };

  return (
    <div className="min-h-screen lg:pt-24 pb-12">
      <div className="px-4 lg:px-16">
        <div className="mb-8">
          <h1 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            Upload Resume & Rewrite with AI
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Upload your resume (PDF) and paste a job description to generate an ATS-optimized resume
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Upload and Job Description */}
          <div className="space-y-6">
            {/* PDF Upload */}
            <div className="border-2 border-dashed border-cyan-300 rounded-lg p-6 text-center hover:border-cyan-400 transition-colors">
              <div {...getRootProps()} className="w-full">
                <input {...getInputProps()} className="hidden" />
                <div className="space-y-3">
                  {isDragActive ? (
                    <p className="text-cyan-600 font-medium">Release to upload</p>
                  ) : (
                    <p className="text-cyan-500">
                      Drag & drop your resume PDF here, or click to select
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    PDF only (max 10MB)
                  </p>
                </div>
              </div>
            </div>

            {isExtracting && (
              <div className="flex items-center justify-center py-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-cyan-600">Extracting text...</span>
                </div>
              </div>
            )}

            {!isExtracting && resumeText && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600">Extracted resume text:</p>
                <pre className="mt-2 text-xs break-all bg-white p-2 rounded">
                  {resumeText.slice(0, 500)}{resumeText.length > 500 ? "..." : ""}
                </pre>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full min-h-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                rows={8}
              />
            </div>

            <button
              onClick={handleRewrite}
              disabled={isRewriting || !resumeText || !jobDescription}
              className="w-full mt-4 px-6 py-3 text-sm font-semibold bg-cyan-600 hover:bg-cyan-700 text-white transition-all disabled:opacity-50 rounded-full"
            >
              {isRewriting ? "Rewriting..." : "Rewrite with AI"}
            </button>
          </div>

          {/* Right: Preview (optional) */}
          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-lg font-semibold mb-4">How it works</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  Upload your resume (PDF) - we extract the text in the background
                </li>
                <li>
                  Paste the target job description
                </li>
                <li>
                  Click "Rewrite with AI" to generate an ATS-optimized resume
                </li>
                <li>
                  Review and edit the generated resume in the builder
                </li>
                <li>
                  Download as PDF or save for future use
                </li>
              </ol>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  The AI will preserve your actual experience while optimizing for the job description.
                  It will never invent untrue experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
