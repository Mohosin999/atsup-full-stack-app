/* ===================================
Scan History Page
View and manage ATS scan history
=================================== */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, FileText, Trash2, ArrowLeft, Search } from "lucide-react";
import { toast } from "react-toastify";
import { atsScoreApi } from "../api/api";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Pagination from "../components/ui/Pagination";
import ConfirmModal from "../components/ui/ConfirmModal";
import Wrapper from "../components/Wrapper";
import { AtsScoreHistory } from "../types";
import { useAppSelector } from "@/hooks";

export default function ScanHistory() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [history, setHistory] = useState<AtsScoreHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [clearAllOpen, setClearAllOpen] = useState(false);

  const fetchHistory = async (pageNum: number = 1) => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }
      if (history.length === 0) {
        setLoading(true);
      }
      const response = await atsScoreApi.getHistory(pageNum, 6);
      setHistory(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setPage(pageNum);
    } catch {
      // silent
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
      fetchHistory(history.length === 1 && page > 1 ? page - 1 : page);
    } catch {
      toast.error("Failed to delete");
    }
    setDeleteId(null);
  };

  const handleClearAll = async () => {
    try {
      await atsScoreApi.deleteAll();
      toast.success("All history cleared");
      setHistory([]);
      setPage(1);
      setTotalPages(1);
    } catch {
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
    <div className="min-h-screen bg-[#F6F9FC] pt-20 pb-12">
      <Wrapper>
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
            <Search className="w-8 h-8 text-violet-600" />
            Scan History
          </h1>
          <p className="text-gray-600">
            View and manage all your ATS scan results
          </p>
        </motion.div>

        {/* Header with Clear All */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            All Scans
          </h2>
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <>
                <span className="text-sm text-gray-500">
                  {history.length} scan{history.length === 1 ? "" : "s"}
                </span>
                <button
                  onClick={() => setClearAllOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-600 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center py-12 border border-dashed border-gray-200 rounded-2xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-violet-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No Scan History
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Your ATS scan results will appear here. Run your first scan to get started.
            </p>
            <button
              onClick={() => navigate("/ats-scan")}
              className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Start Scanning
            </button>
          </motion.div>
        ) : (
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-200 ${
              loading ? "opacity-50" : ""
            }`}
          >
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:border-violet-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                      {item.resumeName}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
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
                    </div>

                    <div className="mt-4">
                      <button
                        onClick={() => navigate(`/ats-scan/${item.id}`)}
                        className="w-full px-4 py-2 bg-violet-500/20 border border-violet-500/30 text-violet-500 rounded-lg hover:bg-violet-500/30 transition-colors text-sm font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setDeleteId(item.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={fetchHistory}
            />
          </div>
        )}
      </Wrapper>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Entry"
        message="Are you sure you want to delete this scan history entry?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
        confirmClassName="bg-red-500 hover:bg-red-600"
      />

      <ConfirmModal
        isOpen={clearAllOpen}
        title="Clear All History"
        message="This will permanently delete all your scan history. This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        onConfirm={handleClearAll}
        onCancel={() => setClearAllOpen(false)}
        confirmClassName="bg-red-500 hover:bg-red-600"
      />
    </div>
  );
}