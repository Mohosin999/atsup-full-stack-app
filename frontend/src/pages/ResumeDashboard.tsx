
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FilePlus2,
  UploadCloud,
  Pencil,
  Trash2,
  FileText,
  Calendar,
  Sparkles,
  Copy,
} from "lucide-react";
import { toast } from "react-toastify";
import { resumeApi } from "../api/api";
import { ResumeContent } from "../types";
import { goToLogin } from "../utils/authGuard";
import { useAppSelector } from "@/hooks";
import Wrapper from "../components/Wrapper";
import Pagination from "../components/ui/Pagination";
import ConfirmModal from "../components/ui/ConfirmModal";
import LoadingSpinner from "../components/ui/LoadingSpinner";

interface ResumeListItem {
  id: string;
  sourceType?: "uploaded" | "builder";
  content: ResumeContent;
  metadata?: { originalName?: string };
  createdAt: string;
  updatedAt: string;
}

export default function ResumeDashboard() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [clearAllOpen, setClearAllOpen] = useState(false);

  const fetchResumes = async (pageNum: number = 1) => {
    try {
      if (!user) {
        setLoading(false);
        return [];
      }
      if (resumes.length === 0) {
        setLoading(true);
      } else {
        setPageLoading(true);
      }
      const response = await resumeApi.getAll(pageNum, 1, "builder");
      const items = response.data.data || [];
      setResumes(items);
      setTotalPages(response.data.pagination?.pages || 1);
      setPage(pageNum);
      return items;
    } catch {
      return [];
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await resumeApi.delete(id);
      toast.success("Resume deleted");
      setDeleteId(null);
      const items = await fetchResumes(page);
      if (items.length === 0 && page > 1) {
        await fetchResumes(page - 1);
      }
    } catch {
      toast.error("Failed to delete resume");
      setDeleteId(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await resumeApi.duplicate(id);
      toast.success("Resume duplicated");
      fetchResumes(page);
    } catch {
      toast.error("Failed to duplicate resume");
    }
  };

  const handleClearAll = async () => {
    try {
      await resumeApi.deleteAll();
      toast.success("All resumes deleted");
      setResumes([]);
      setPage(1);
      setTotalPages(1);
    } catch {
      toast.error("Failed to delete resumes");
    }
    setClearAllOpen(false);
  };

  const getResumeTitle = (resume: ResumeListItem) =>
    resume.content?.personalInfo?.fullName?.trim() ||
    resume.metadata?.originalName ||
    "Untitled Resume";

  const getResumeSubtitle = (resume: ResumeListItem) => {
    const info = resume.content?.personalInfo || {};
    const parts: string[] = [];
    if (info.jobTitle?.trim()) parts.push(info.jobTitle.trim());
    if (info.contact?.email?.trim()) parts.push(info.contact.email.trim());
    return parts.join(" · ");
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <Wrapper maxWidth="max-w-6xl">
        <div className="mt-6 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <FileText className="w-8 h-8 text-green-600" />
            Resume Builder
          </h1>
          <p className="text-gray-600 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-green-600" />
            Build ATS-friendly resumes in minutes, preview live and download.
          </p>
        </motion.div>

        {/* Two action cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Create new resume */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-gradient-to-br from-green-50 to-cyan-50 border border-green-200 rounded-2xl p-6 flex flex-col items-start"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-cyan-600 flex items-center justify-center mb-4 shadow-lg shadow-green-500/25">
              <FilePlus2 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Create a New Resume
            </h3>
            <p className="text-sm text-gray-600 mb-6 flex-1">
              Start from scratch with our live builder. Fill in your details
              and watch an ATS-friendly resume render in real time.
            </p>
            <button
              onClick={() =>
                user
                  ? navigate("/resume-builder/new")
                  : goToLogin(navigate, "/resume-builder")
              }
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-green-500/25 transition-all"
            >
              <FilePlus2 className="w-5 h-5" />
              Create Resume
            </button>
          </motion.div>

          {/* Upload resume (upcoming) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-start group relative"
          >
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center mb-4">
              <UploadCloud className="w-7 h-7 text-violet-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Upload Resume & Rewrite with AI
            </h3>
            <p className="text-sm text-gray-600 mb-6 flex-1">
              Upload an existing resume and let AI rewrite, structure and
              optimize it for ATS.
            </p>
            <div className="w-full relative">
              <button
                disabled
                title="Coming soon"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed font-semibold"
              >
                <UploadCloud className="w-5 h-5" />
                Upload Resume
              </button>
              <span className="pointer-events-none absolute -top-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                Upcoming
              </span>
            </div>
          </motion.div>
        </div>

        {/* Previous resumes */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : resumes.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Previous Resumes
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {totalPages} resume{totalPages === 1 ? "" : "s"}
                </span>
                <button
                  onClick={() => setClearAllOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-600 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete All
                </button>
              </div>
            </div>

            <div
              className={`space-y-4 transition-opacity duration-200 ${
                pageLoading ? "opacity-50" : ""
              }`}
            >
              {resumes.map((resume, index) => (
                <motion.div
                  key={resume.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:border-green-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                        {getResumeTitle(resume)}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3 truncate">
                        {getResumeSubtitle(resume) || "Resume"}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(resume.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() =>
                            navigate(`/resume-builder/${resume.id}`)
                          }
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-700 rounded-lg hover:bg-green-500/30 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit Resume
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleDuplicate(resume.id)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-500/10 rounded-lg transition-colors"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(resume.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={fetchResumes}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center py-12 border border-dashed border-gray-200 rounded-2xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No resumes yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Your saved resumes will appear here. Create your first resume to
              get started.
            </p>
            <button
              onClick={() =>
                user
                  ? navigate("/resume-builder/new")
                  : goToLogin(navigate, "/resume-builder")
              }
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700 text-white font-medium rounded-xl transition-all flex items-center gap-2"
            >
              <FilePlus2 className="w-5 h-5" />
              Create Your First Resume
            </button>
          </motion.div>
        )}
      </Wrapper>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Resume"
        message="Are you sure you want to delete this resume? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
        confirmClassName="bg-red-500 hover:bg-red-600"
      />

      <ConfirmModal
        isOpen={clearAllOpen}
        title="Delete All Resumes"
        message="This will permanently delete all your resumes. This action cannot be undone."
        confirmText="Delete All"
        cancelText="Cancel"
        onConfirm={handleClearAll}
        onCancel={() => setClearAllOpen(false)}
        confirmClassName="bg-red-500 hover:bg-red-600"
      />
    </div>
  );
}
