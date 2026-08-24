import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  FileText,
  Trash2,
  Search,
  Pencil,
  Check,
  X,
  Eye,
} from "lucide-react";
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
  const [totalScans, setTotalScans] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [clearAllOpen, setClearAllOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  const fetchHistory = async (pageNum: number = 1) => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }
      if (history.length === 0) {
        setLoading(true);
      }
      const response = await atsScoreApi.getHistory(pageNum, 7);
      setHistory(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setTotalScans(response.data.pagination?.total || 0);
      setPage(pageNum);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (editingId && inputRef.current && measureRef.current) {
      const textWidth = measureRef.current.offsetWidth;
      inputRef.current.style.width = `${Math.min(textWidth + 20, 480)}px`;
    }
  }, [editValue, editingId]);

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

  const handleRename = async (id: string) => {
    if (!editValue.trim()) return;
    try {
      await atsScoreApi.rename(id, editValue.trim());
      setHistory((prev) =>
        prev.map((item) =>
          (item.id || (item as any)._id) === id
            ? { ...item, resumeName: editValue.trim() }
            : item,
        ),
      );
      setEditingId(null);
    } catch {
      toast.error("Failed to rename");
    }
  };

  const handleClearAll = async () => {
    try {
      await atsScoreApi.deleteAll();
      toast.success("All history cleared");
      setHistory([]);
      setPage(1);
      setTotalPages(1);
      setTotalScans(0);
    } catch {
      toast.error("Failed to clear history");
    }
    setClearAllOpen(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen bg-white pt-20 pb-12">
      <Wrapper>
        <div>
          {/* Header */}
          <div className="flex flex-row my-8 justify-between items-start md:items-center gap-3 md:gap-4 mb-4 md:mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
                Scan History
              </h1>
              <span className="text-sm text-gray-500">
                {totalScans} scan{totalScans !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex items-center">
              {totalScans > 0 && (
                <button
                  onClick={() => setClearAllOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-500/20 border border-red-500/30 text-red-600 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center py-12 md:py-16 lg:py-20">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Desktop Table - visible from md breakpoint */}
              <div className="hidden md:block border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#A5D9FC] border-b border-gray-300 text-left">
                      <th className="px-3 lg:px-5 py-2.5 lg:py-3 font-medium text-sm text-gray-700 w-[40%]">
                        Name
                      </th>
                      <th className="px-3 lg:px-5 py-2.5 lg:py-3 font-medium text-sm text-gray-700 w-[20%]">
                        Score
                      </th>
                      <th className="px-3 lg:px-5 py-2.5 lg:py-3 font-medium text-sm text-gray-700 w-[25%]">
                        Scan date
                      </th>
                      <th className="px-3 lg:px-5 py-2.5 lg:py-3 font-medium text-sm text-gray-700 w-[15%]"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-16 lg:py-24 text-center text-sm text-gray-500"
                        >
                          No Scan History
                        </td>
                      </tr>
                    ) : (
                      history.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-gray-300 last:border-b-0"
                        >
                          <td className="px-3 lg:px-5 py-4 lg:py-5">
                            {editingId === item.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  ref={inputRef}
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() => handleRename(item.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      handleRename(item.id);
                                    if (e.key === "Escape") setEditingId(null);
                                  }}
                                  autoFocus
                                  className="bg-transparent border border-gray-300 rounded px-2 py-1 text-gray-700 text-sm focus:outline-none"
                                />
                                <span
                                  ref={measureRef}
                                  className="absolute invisible whitespace-pre text-sm"
                                >
                                  {editValue}
                                </span>
                                <button onClick={() => handleRename(item.id)}>
                                  <Check className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-green-600" />
                                </button>

                                <button onClick={() => setEditingId(null)}>
                                  <X className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-red-500" />
                                </button>
                              </div>
                            ) : (
                              <div className="group flex items-center gap-2">
                                <span className="font-semibold text-gray-700 text-sm">
                                  {item.resumeName}
                                </span>

                                <button
                                  onClick={() => {
                                    setEditingId(item.id);
                                    setEditValue(item.resumeName);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition"
                                >
                                  <Pencil className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-gray-500 hover:text-cyan-500" />
                                </button>
                              </div>
                            )}
                          </td>

                          <td className="px-3 lg:px-6 py-4 lg:py-5">
                            <span
                              className={`font-semibold text-sm ${getScoreColor(
                                item.overallScore,
                              )}`}
                            >
                              {item.overallScore}%
                            </span>
                          </td>

                          <td className="px-3 lg:px-0 py-4 lg:py-5 text-gray-700 text-sm">
                            {new Date(item.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </td>

                          <td className="px-3 lg:px-5 py-4 lg:py-5">
                            <div className="flex justify-end gap-3 lg:gap-5 text-sm text-gray-700">
                              <button
                                onClick={() => navigate(`/ats-scan/${item.id}`)}
                                className="hover:text-cyan-600 transition"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setDeleteId(item.id)}
                                className="hover:text-red-400 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Layout - visible below md breakpoint */}
              <div className="md:hidden border border-gray-300 rounded-lg overflow-hidden divide-y divide-gray-200">
                {history.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-500">
                    No Scan History
                  </div>
                ) : (
                  history.map((item) => (
                    <div key={item.id} className="p-3">
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0 flex-1">
                          {editingId === item.id ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <input
                                ref={inputRef}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => handleRename(item.id)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleRename(item.id);
                                  if (e.key === "Escape") setEditingId(null);
                                }}
                                autoFocus
                                className="bg-transparent border border-gray-300 rounded px-2 py-1 text-gray-700 text-sm w-full"
                              />
                              <span
                                ref={measureRef}
                                className="absolute invisible whitespace-pre text-sm"
                              >
                                {editValue}
                              </span>
                              <button onClick={() => handleRename(item.id)}>
                                <Check className="w-4 h-4 text-green-600" />
                              </button>

                              <button onClick={() => setEditingId(null)}>
                                <X className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          ) : (
                            <div className="group flex items-center gap-2">
                              <h3 className="font-semibold text-sm truncate text-gray-700">
                                {item.resumeName}
                              </h3>

                              <button
                                onClick={() => {
                                  setEditingId(item.id);
                                  setEditValue(item.resumeName);
                                }}
                                className="opacity-70"
                              >
                                <Pencil className="w-3.5 h-3.5 text-gray-500" />
                              </button>
                            </div>
                          )}

                          <p className="mt-1.5 text-sm">
                            <span className="text-gray-500">Score:</span>{" "}
                            <span
                              className={`font-semibold ${getScoreColor(
                                item.overallScore,
                              )}`}
                            >
                              {item.overallScore}%
                            </span>
                          </p>

                          <p className="text-sm text-gray-500 mt-0.5">
                            {new Date(item.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-4 mt-3 text-sm text-gray-700">
                        <button
                          onClick={() => navigate(`/ats-scan/${item.id}`)}
                          className="hover:text-cyan-600 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteId(item.id)}
                          className="hover:text-red-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {totalPages > 1 && (
                <div className="mt-4 md:mt-6">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={fetchHistory}
                  />
                </div>
              )}
            </>
          )}
        </div>

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
      </Wrapper>
    </div>
  );
}
