import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, Pencil, Check, X, Eye, ScanSearch, Sparkles, FileSearch } from "lucide-react";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { atsScoreApi } from "../api/api";
import Pagination from "../components/ui/Pagination";
import ConfirmModal from "../components/ui/ConfirmModal";
import Wrapper from "../components/Wrapper";
import { AtsScoreHistory } from "../types";
import { useAppSelector } from "@/hooks";
import SkeletonHistory from "@/components/ui/SkeletonHistory";

export default function ScanHistory() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [clearAllOpen, setClearAllOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  const { data, isLoading: loading } = useQuery({
    queryKey: ["ats-history", user?._id, page],
    queryFn: async () => {
      if (!user) return { data: [], pagination: { totalPages: 1, total: 0 } };
      const res = await atsScoreApi.getHistory(page, 7);
      return {
        data: res.data.data || [],
        pagination: res.data.pagination || { totalPages: 1, total: 0 },
      };
    },
    enabled: !!user,
    placeholderData: (prev) => prev,
  });

  const history = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;
  const totalScans = data?.pagination?.total || 0;

  useEffect(() => {
    if (editingId && inputRef.current && measureRef.current) {
      const textWidth = measureRef.current.offsetWidth;
      inputRef.current.style.width = `${Math.min(textWidth + 20, 480)}px`;
    }
  }, [editValue, editingId]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => atsScoreApi.delete(id),
    onSuccess: () => {
      toast.success("Deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["ats-history", user?._id] });
      if (history.length === 1 && page > 1) setPage(page - 1);
    },
    onError: () => toast.error("Failed to delete"),
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      atsScoreApi.rename(id, name),
    onSuccess: (_, variables) => {
      queryClient.setQueryData(["ats-history", user?._id, page], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((item: AtsScoreHistory) =>
            (item.id || (item as any)._id) === variables.id
              ? { ...item, resumeName: variables.name }
              : item,
          ),
        };
      });
      setEditingId(null);
    },
    onError: () => toast.error("Failed to rename"),
  });

  const clearAllMutation = useMutation({
    mutationFn: () => atsScoreApi.deleteAll(),
    onSuccess: () => {
      toast.success("All history cleared");
      queryClient.invalidateQueries({ queryKey: ["ats-history", user?._id] });
      setPage(1);
      setClearAllOpen(false);
    },
    onError: () => toast.error("Failed to clear history"),
  });

  const getScoreStyle = (score: number) => {
    if (score >= 70)
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20";
    if (score >= 40)
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-400/20";
    return "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20";
  };

  return (
    <div className="min-h-screen lg:pt-20 pb-16 bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <Wrapper>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-8 lg:pt-10 pb-6"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-plex inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-400/10 dark:text-amber-200 dark:border-amber-400/20">
                <Sparkles className="w-3.5 h-3.5" />
                ATS history
              </span>
              <h1 className="font-fraunces mt-3 text-2xl md:text-3xl font-normal text-stone-900 dark:text-stone-50">
                Scan history{" "}
                <span className="font-plex text-sm font-normal text-stone-500 dark:text-stone-400">
                  — {totalScans} scan{totalScans !== 1 ? "s" : ""}
                </span>
              </h1>
              <p className="font-plex mt-1 text-sm text-stone-500 dark:text-stone-400">
                Every scan you ran — scores, dates, and quick access to details.
              </p>
            </div>

            {totalScans > 0 && (
              <button
                onClick={() => setClearAllOpen(true)}
                className="font-plex self-start md:self-auto inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white dark:bg-stone-900 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                Clear all
              </button>
            )}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-8">
            <SkeletonHistory />
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-stone-100 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-800 text-left">
                      <th className="font-plex px-5 py-3.5 text-xs font-semibold tracking-wide uppercase text-stone-500 dark:text-stone-400 w-[40%]">
                        Resume
                      </th>
                      <th className="font-plex px-5 py-3.5 text-xs font-semibold tracking-wide uppercase text-stone-500 dark:text-stone-400 w-[18%]">
                        Score
                      </th>
                      <th className="font-plex px-5 py-3.5 text-xs font-semibold tracking-wide uppercase text-stone-500 dark:text-stone-400 w-[27%]">
                        Scanned on
                      </th>
                      <th className="px-5 py-3.5 w-[15%]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-20 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                              <FileSearch className="w-6 h-6 text-stone-400" />
                            </div>
                            <p className="font-plex text-sm font-medium text-stone-700 dark:text-stone-300">
                              No scans yet
                            </p>
                            <p className="font-plex text-xs text-stone-500 dark:text-stone-400 max-w-sm">
                              Run your first ATS scan — you will see the score and details here.
                            </p>
                            <button
                              onClick={() => navigate("/ats-scan")}
                              className="font-plex mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-stone-900 dark:bg-lime-300 text-white dark:text-stone-900 text-sm font-semibold hover:bg-stone-800 dark:hover:bg-lime-200 transition-colors"
                            >
                              <ScanSearch className="w-4 h-4" />
                              Scan now
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      history.map((item: AtsScoreHistory) => (
                        <tr
                          key={item.id}
                          className="group hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                        >
                          <td className="px-5 py-4">
                            {editingId === item.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  ref={inputRef}
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() =>
                                    renameMutation.mutate({
                                      id: item.id,
                                      name: editValue.trim(),
                                    })
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      renameMutation.mutate({
                                        id: item.id,
                                        name: editValue.trim(),
                                      });
                                    if (e.key === "Escape") setEditingId(null);
                                  }}
                                  autoFocus
                                  className="font-plex bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-lg px-2.5 py-1.5 text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-lime-300 focus:border-transparent"
                                />
                                <span
                                  ref={measureRef}
                                  className="absolute invisible whitespace-pre text-sm font-plex"
                                >
                                  {editValue}
                                </span>
                                <button
                                  onClick={() =>
                                    renameMutation.mutate({
                                      id: item.id,
                                      name: editValue.trim(),
                                    })
                                  }
                                  className="p-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-plex text-sm font-medium text-stone-800 dark:text-stone-100 truncate">
                                  {item.resumeName}
                                </span>
                                <button
                                  onClick={() => {
                                    setEditingId(item.id);
                                    setEditValue(item.resumeName);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-all shrink-0"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200" />
                                </button>
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`font-plex inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getScoreStyle(item.overallScore)}`}
                            >
                              {item.overallScore}%
                            </span>
                          </td>

                          <td className="font-plex px-5 py-4 text-sm text-stone-600 dark:text-stone-400">
                            {new Date(item.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => navigate(`/ats-scan/${item.id}`)}
                                className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteId(item.id)}
                                className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 text-stone-400 hover:text-red-600 transition-colors"
                                title="Delete"
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
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {history.length === 0 ? (
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-8 text-center shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto">
                    <FileSearch className="w-6 h-6 text-stone-400" />
                  </div>
                  <p className="font-plex mt-3 text-sm font-medium text-stone-700 dark:text-stone-300">No scans yet</p>
                  <p className="font-plex mt-1 text-xs text-stone-500 dark:text-stone-400">Run your first scan to see it here.</p>
                  <button
                    onClick={() => navigate("/ats-scan")}
                    className="font-plex mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-stone-900 dark:bg-lime-300 text-white dark:text-stone-900 text-sm font-semibold"
                  >
                    <ScanSearch className="w-4 h-4" /> Scan now
                  </button>
                </div>
              ) : (
                history.map((item: AtsScoreHistory) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        {editingId === item.id ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() =>
                                renameMutation.mutate({ id: item.id, name: editValue.trim() })
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  renameMutation.mutate({ id: item.id, name: editValue.trim() });
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              autoFocus
                              className="font-plex flex-1 min-w-0 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-lg px-2.5 py-1.5 text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-lime-300"
                            />
                            <button onClick={() => renameMutation.mutate({ id: item.id, name: editValue.trim() })} className="p-1 text-emerald-600">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1 text-red-500">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h3 className="font-plex text-sm font-medium text-stone-800 dark:text-stone-100 truncate">
                              {item.resumeName}
                            </h3>
                            <button
                              onClick={() => {
                                setEditingId(item.id);
                                setEditValue(item.resumeName);
                              }}
                              className="p-1 shrink-0"
                            >
                              <Pencil className="w-3.5 h-3.5 text-stone-400" />
                            </button>
                          </div>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`font-plex inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${getScoreStyle(item.overallScore)}`}>
                            {item.overallScore}%
                          </span>
                          <span className="font-plex text-xs text-stone-500 dark:text-stone-400">
                            {new Date(item.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-1">
                      <button
                        onClick={() => navigate(`/ats-scan/${item.id}`)}
                        className="p-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(item.id)} className="p-2 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full px-2 py-2 shadow-sm">
                  <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
              </div>
            )}
          </>
        )}

        <ConfirmModal
          isOpen={!!deleteId}
          title="Delete entry?"
          message="Are you sure you want to delete this scan? This cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={() => {
            if (deleteId) deleteMutation.mutate(deleteId);
            setDeleteId(null);
          }}
          onCancel={() => setDeleteId(null)}
          confirmClassName="bg-red-500 hover:bg-red-600"
        />

        <ConfirmModal
          isOpen={clearAllOpen}
          title="Clear all history?"
          message="This will permanently delete all your scan history. This cannot be undone."
          confirmText="Clear all"
          cancelText="Cancel"
          onConfirm={() => clearAllMutation.mutate()}
          onCancel={() => setClearAllOpen(false)}
          confirmClassName="bg-red-500 hover:bg-red-600"
        />
      </Wrapper>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        .font-fraunces { font-family: 'Fraunces', serif; }
        .font-plex { font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>
    </div>
  );
}
