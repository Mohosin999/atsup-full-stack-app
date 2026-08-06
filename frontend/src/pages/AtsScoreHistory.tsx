/* ===================================
ATS Score History Page
=================================== */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, Calendar, FileText } from "lucide-react";
import { toast } from "react-toastify";
import { atsScoreApi } from "../api/api";
import { AtsScoreHistory } from "../types";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Pagination from "../components/ui/Pagination";
import ConfirmModal from "../components/ui/ConfirmModal";
import Wrapper from "../components/Wrapper";

export default function AtsScoreHistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<AtsScoreHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [clearAllOpen, setClearAllOpen] = useState(false);

  const fetchHistory = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const response = await atsScoreApi.getAll(pageNum, 3);
      setHistory(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setPage(pageNum);
    } catch (error) {
      // Silent fail - don't show toast on history page load
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await atsScoreApi.delete(id);
      toast.success("Deleted successfully");
      fetchHistory(page);
    } catch (error) {
      toast.error("Failed to delete");
    }
    setDeleteId(null);
  };

  const handleClearAll = async () => {
    try {
      await atsScoreApi.deleteAll();
      toast.success("All history cleared");
      fetchHistory(1);
    } catch (error) {
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

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <Wrapper maxWidth="max-w-5xl">
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
          className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ATS Score History
            </h1>
            <p className="text-gray-600">
              View all your past ATS score analyses
            </p>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => setClearAllOpen(true)}
              className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-600 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
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
            <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-violet-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No ATS Score History
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Your ATS score analyses will appear here once you analyze your
              first resume.
            </p>
            <button
              onClick={() => navigate("/ats-score")}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Analyze Your First Resume
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.resumeName}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                      <div
                        className={`p-3 rounded-lg border ${getScoreBg(item.spellingGrammar.score)}`}
                      >
                        <p className="text-xs text-gray-600 mb-1">Grammar</p>
                        <p
                          className={`text-xl font-bold ${getScoreColor(item.spellingGrammar.score)}`}
                        >
                          {item.spellingGrammar.score}%
                        </p>
                      </div>
                      <div className="p-3 rounded-lg border bg-gray-100 border-gray-300/50">
                        <p className="text-xs text-gray-600 mb-1">Errors</p>
                        <p className="text-xl font-bold text-gray-900">
                          {item.spellingGrammar.errors.length}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => navigate(`/ats-score/${item.id}`)}
                        className="px-4 py-2 bg-violet-500/20 border border-violet-500/30 text-violet-400 rounded-lg hover:bg-violet-500/30 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setDeleteId(item.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
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
      </Wrapper>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Entry"
        message="Are you sure you want to delete this ATS score history entry?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => deleteId && handleDelete(deleteId)}
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
    </div>
  );
}
