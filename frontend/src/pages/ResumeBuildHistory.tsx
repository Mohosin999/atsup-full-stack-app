/* ===================================
Resume Build History Page
=================================== */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, Calendar, FileText, Pencil } from "lucide-react";
import { toast } from "react-toastify";
import { resumeBuildHistoryApi } from "../api/api";
import { ResumeBuildHistory } from "../types";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Pagination from "../components/ui/Pagination";
import ConfirmModal from "../components/ui/ConfirmModal";

export default function ResumeBuildHistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ResumeBuildHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [clearAllOpen, setClearAllOpen] = useState(false);

  const fetchHistory = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const response = await resumeBuildHistoryApi.getAll(pageNum, 3);
      setHistory(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setPage(pageNum);
    } catch (error) {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await resumeBuildHistoryApi.delete(id);
      toast.success("Deleted successfully");
      fetchHistory(page);
    } catch (error) {
      toast.error("Failed to delete");
    }
    setDeleteId(null);
  };

  const handleClearAll = async () => {
    try {
      await resumeBuildHistoryApi.deleteAll();
      toast.success("All history cleared");
      fetchHistory(1);
    } catch (error) {
      toast.error("Failed to clear history");
    }
    setClearAllOpen(false);
  };

  const handleLoadToBuilder = (item: ResumeBuildHistory) => {
    navigate(`/builder/${item._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="mt-6 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Resume Build History
            </h1>
            <p className="text-gray-400">View all your built resumes</p>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => setClearAllOpen(true)}
              className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No Resume Build History
            </h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Your built resumes will appear here once you create your first
              resume using the builder.
            </p>
            <button
              onClick={() => navigate("/builder")}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-medium rounded-xl transition-all flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Build Your First Resume
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {item.resumeContent?.personalInfo?.jobTitle || "Untitled"}{" "}
                      Resume
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                      {item.resumeContent?.personalInfo?.jobTitle && (
                        <span className="text-gray-300">
                          {item.resumeContent.personalInfo.jobTitle}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.resumeContent?.experience?.length > 0 && (
                        <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-full text-xs">
                          {item.resumeContent.experience.length} Experience
                        </span>
                      )}
                      {item.resumeContent?.education?.length > 0 && (
                        <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-full text-xs">
                          {item.resumeContent.education.length} Education
                        </span>
                      )}
                      {(item.resumeContent?.skills?.length || 0) > 0 && (
                        <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 rounded-full text-xs">
                          {item.resumeContent.skills?.length || 0} Skills
                        </span>
                      )}
                      {item.resumeContent?.projects &&
                        item.resumeContent.projects.length > 0 && (
                          <span className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-full text-xs">
                            {item.resumeContent.projects.length} Projects
                          </span>
                        )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleLoadToBuilder(item)}
                        className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors flex items-center gap-2"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit Resume
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setDeleteId(item._id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}

            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={fetchHistory}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Entry"
        message="Are you sure you want to delete this resume build history entry?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
        confirmClassName="bg-red-500 hover:bg-red-600"
      />

      <ConfirmModal
        isOpen={clearAllOpen}
        title="Clear All History"
        message="This will permanently delete all your resume build history. This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        onConfirm={handleClearAll}
        onCancel={() => setClearAllOpen(false)}
        confirmClassName="bg-red-500 hover:bg-red-600"
      />
    </div>
  );
}
