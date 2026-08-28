import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { resumeApi } from "../../api/api";
import ConfirmModal from "../ui/ConfirmModal";

interface ResumeItem {
  _id: string;
  id: string;
  content?: {
    personalInfo?: {
      fullName?: string;
      jobTitle?: string;
    };
  };
  metadata: {
    originalName: string;
  };
  sourceType?: string;
  createdAt: string;
}

export default function RecentResumes({
  resumes,
  loading,
  onDelete,
}: {
  resumes: ResumeItem[];
  loading: boolean;
  onDelete?: (id: string) => void;
}) {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getResumeName = (resume: ResumeItem) =>
    resume.metadata?.originalName?.trim() ||
    resume.content?.personalInfo?.jobTitle?.trim() ||
    resume.content?.personalInfo?.fullName?.trim() ||
    "Untitled Resume";

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await resumeApi.delete(deleteId);
      toast.success("Resume deleted");
      onDelete?.(deleteId);
    } catch {
      toast.error("Failed to delete resume");
    }
    setDeleteId(null);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-white dark:bg-gray-800 box-shadow border border-gray-100 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Recent Resumes</h2>
          {!loading && resumes.length > 0 && (
            <Link
              to="/resume-history"
              className="text-sm font-medium text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
            >
              See More <ArrowUpRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-14 bg-gray-100 dark:bg-gray-700 animate-pulse"
              />
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
            No resumes yet
          </p>
        ) : (
          <div>
            {resumes.map((resume) => (
              <div
                key={resume.id || resume._id}
                className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-50 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate max-w-[200px]">
                      {getResumeName(resume)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      navigate(`/resume-builder/${resume.id || resume._id}`)
                    }
                    className="p-1.5 hover:bg-cyan-50 text-gray-400 dark:text-gray-500 hover:text-cyan-600 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(resume.id || resume._id)}
                    className="p-1.5 hover:bg-red-50 text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Resume"
        message="Are you sure you want to delete this resume? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmClassName="bg-red-500 hover:bg-red-600"
      />
    </>
  );
}
