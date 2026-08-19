import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, FileText, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { atsScoreApi } from "../api/api";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Pagination from "../components/ui/Pagination";
import ConfirmModal from "../components/ui/ConfirmModal";
import Wrapper from "../components/Wrapper";
import { AtsScoreHistory } from "../types";
import AtsScoreResult from "../components/ats-result/AtsScoreResult";
import ResumeScanForm from "../components/ats-scan/ResumeScanForm";
import { useAppSelector } from "@/hooks";

export default function AtsScorePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const [result, setResult] = useState<AtsScoreHistory | null>(
    (location.state as { result?: AtsScoreHistory } | null)?.result ?? null,
  );
  const [initialResumeFile, setInitialResumeFile] = useState<File | null>(
    (location.state as { initialResumeFile?: File } | null)
      ?.initialResumeFile ?? null,
  );
  const [initialResumeName, setInitialResumeName] = useState<string>(
    (location.state as { initialResumeName?: string } | null)
      ?.initialResumeName ?? "",
  );
  const [history, setHistory] = useState<AtsScoreHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [clearAllOpen, setClearAllOpen] = useState(false);

  useEffect(() => {
    const state = location.state as
      | { result?: AtsScoreHistory; initialResumeFile?: File; initialResumeName?: string }
      | null;
    if (state?.result) {
      setResult(state.result);
    }
    if (state?.initialResumeFile) {
      setInitialResumeFile(state.initialResumeFile);
      setInitialResumeName(state.initialResumeName ?? state.initialResumeFile.name);
    }
    if (state?.result || state?.initialResumeFile) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, navigate, location.pathname]);

  const fetchHistory = async (pageNum: number = 1) => {
    try {
      if (!user) {
        setHistoryLoading(false);
        return;
      }
      if (history.length === 0) {
        setHistoryLoading(true);
      }
      const response = await atsScoreApi.getHistory(pageNum, 2);
      setHistory(response.data.data || []);
      setHistoryTotalPages(response.data.pagination?.totalPages || 1);
      setHistoryPage(pageNum);
    } catch {
      // silent fail
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteHistory = async (id: string) => {
    try {
      await atsScoreApi.delete(id);
      toast.success("Deleted successfully");
      fetchHistory(
        history.length === 1 && historyPage > 1 ? historyPage - 1 : historyPage,
      );
    } catch {
      toast.error("Failed to delete");
    }
    setDeleteId(null);
  };

  const handleClearAll = async () => {
    try {
      await atsScoreApi.deleteAll();
      toast.success("All history cleared");
      fetchHistory(1);
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="my-8"
        >
          <h1 className="text-lg font-bold text-gray-900 mb-1">
            ATS Score Check
          </h1>
          <p className="text-sm text-gray-600">
            Analyze your resume for ATS (Applicant Tracking System)
            compatibility — unlimited, no credits used
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-6 shadow-[0_0_3px_rgba(0,0,0,0.2)]"
        >
          <ResumeScanForm
            initialResumeFile={initialResumeFile}
            initialResumeName={initialResumeName}
          />
        </motion.div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-8"
          >
            <AtsScoreResult result={result} />
          </motion.div>
        )}

        {/* ATS Score History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-10"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              ATS Score History
            </h2>
            <div className="flex items-center gap-3">
              {history.length > 0 && (
                <>
                  <span className="text-sm text-gray-500">
                    {historyTotalPages} page{historyTotalPages === 1 ? "" : "s"}
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

          {historyLoading && history.length === 0 ? (
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
                No ATS Score History
              </h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Your ATS score analyses will appear here once you analyze your
                first resume.
              </p>
            </motion.div>
          ) : (
            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-200 ${
                historyLoading ? "opacity-50" : ""
              }`}
            >
              {history.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:border-violet-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
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

                      <div className="grid grid-cols-2 gap-4">
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
                          onClick={() => navigate(`/ats-score/${item.id}`)}
                          className="px-4 py-2 bg-violet-500/20 border border-violet-500/30 text-violet-500 rounded-lg hover:bg-violet-500/30 transition-colors"
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

          {historyTotalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={historyPage}
                totalPages={historyTotalPages}
                onPageChange={fetchHistory}
              />
            </div>
          )}
        </motion.div>
      </Wrapper>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Entry"
        message="Are you sure you want to delete this ATS score history entry?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => deleteId && handleDeleteHistory(deleteId)}
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
