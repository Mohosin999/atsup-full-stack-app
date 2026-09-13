import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, Pencil, Check, X, Eye } from "lucide-react";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { atsScoreApi } from "../api/api";
import LoadingSpinner from "../components/ui/LoadingSpinner";
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

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen lg:pt-20 pb-12">
      <Wrapper>
        <div>
          {/* Header */}
          <div className="pt-8 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100">
                Scan History{" "}
                <span className="text-sm !font-normal text-gray-500 dark:text-gray-400">
                  - {totalScans} scan{totalScans !== 1 ? "s" : ""}
                </span>
              </h1>
            </div>

            <div className="flex items-center">
              {totalScans > 0 && (
                <button
                  onClick={() => setClearAllOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-red-500/20 dark:bg-red-500/10 border border-red-500/30 dark:border-accent text-red-600 dark:text-red-100 hover:bg-red-500/30 dark:hover:bg-accent rounded-full"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center">
              {/* <LoadingSpinner /> */}
              <SkeletonHistory />
            </div>
          ) : (
            <>
              {/* Desktop Table - visible from md breakpoint */}
              <div className="hidden md:block dark:bg-secondary border border-gray-300 overflow-hidden rounded-lg dark:border-gray-600">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#A5D9FC] dark:bg-accent border-b border-[#A5D9FC] dark:border-accent text-left">
                      <th className="px-3 lg:px-5 py-2.5 lg:py-3 font-medium text-sm w-[40%]">
                        Name
                      </th>
                      <th className="px-3 lg:px-5 py-2.5 lg:py-3 font-medium text-sm w-[20%]">
                        Score
                      </th>
                      <th className="px-3 lg:px-5 py-2.5 lg:py-3 font-medium text-sm w-[25%]">
                        Scan date
                      </th>
                      <th className="px-3 lg:px-5 py-2.5 lg:py-3 font-medium text-sm w-[15%]"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-16 lg:py-24 text-center text-sm text-gray-500 dark:text-gray-400"
                        >
                          No Scan History
                        </td>
                      </tr>
                    ) : (
                      history.map((item: AtsScoreHistory) => (
                        <tr
                          key={item.id}
                          className="border-b border-gray-300 last:border-b-0 dark:border-gray-600"
                        >
                          <td className="px-3 lg:px-5 py-4 lg:py-5">
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
                                  className="bg-transparent border border-gray-300 px-2 py-1 text-gray-700 dark:text-gray-300 text-sm focus:outline-none dark:border-gray-600"
                                />
                                <span
                                  ref={measureRef}
                                  className="absolute invisible whitespace-pre text-sm"
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
                                >
                                  <Check className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-green-600" />
                                </button>

                                <button onClick={() => setEditingId(null)}>
                                  <X className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-red-500" />
                                </button>
                              </div>
                            ) : (
                              <div className="group flex items-center gap-2">
                                <span className="text-gray-700 dark:text-gray-300 text-sm">
                                  {item.resumeName}
                                </span>

                                <button
                                  onClick={() => {
                                    setEditingId(item.id);
                                    setEditValue(item.resumeName);
                                  }}
                                  className="transition"
                                >
                                  <Pencil className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-gray-500 dark:text-gray-400 hover:text-cyan-500" />
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

                          <td className="px-3 lg:px-0 py-4 lg:py-5 text-gray-700 dark:text-gray-300 text-sm">
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
                            <div className="flex justify-end gap-3 lg:gap-5 text-sm text-gray-700 dark:text-gray-300">
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
              <div className="bg-white md:hidden border border-gray-300 overflow-hidden divide-y divide-gray-200 dark:bg-gray-800 dark:border-gray-600 dark:divide-gray-700">
                {history.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    No Scan History
                  </div>
                ) : (
                  history.map((item: AtsScoreHistory) => (
                    <div key={item.id} className="p-3">
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0 flex-1">
                          {editingId === item.id ? (
                            <div className="flex items-center gap-2 flex-wrap">
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
                                className="bg-transparent border border-gray-300 px-2 py-1 text-gray-700 dark:text-gray-300 text-sm w-full dark:border-gray-600"
                              />
                              <span
                                ref={measureRef}
                                className="absolute invisible whitespace-pre text-sm"
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
                              >
                                <Check className="w-4 h-4 text-green-600" />
                              </button>

                              <button onClick={() => setEditingId(null)}>
                                <X className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          ) : (
                            <div className="group flex items-center gap-2">
                              <h3 className="text-sm truncate text-gray-700 dark:text-gray-300">
                                {item.resumeName}
                              </h3>

                              <button
                                onClick={() => {
                                  setEditingId(item.id);
                                  setEditValue(item.resumeName);
                                }}
                                className="opacity-70"
                              >
                                <Pencil className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                              </button>
                            </div>
                          )}

                          <p className="mt-1.5 text-sm">
                            <span className="text-gray-500 dark:text-gray-400">
                              Score:
                            </span>{" "}
                            <span
                              className={`font-semibold ${getScoreColor(
                                item.overallScore,
                              )}`}
                            >
                              {item.overallScore}%
                            </span>
                          </p>

                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
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

                      <div className="flex items-center justify-end gap-4 mt-3 text-sm text-gray-700 dark:text-gray-300">
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
                    onPageChange={setPage}
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
          onConfirm={() => {
            if (deleteId) deleteMutation.mutate(deleteId);
            setDeleteId(null);
          }}
          onCancel={() => setDeleteId(null)}
          confirmClassName="bg-red-500 hover:bg-red-600"
        />

        <ConfirmModal
          isOpen={clearAllOpen}
          title="Clear All History"
          message="This will permanently delete all your scan history. This action cannot be undone."
          confirmText="Clear All"
          cancelText="Cancel"
          onConfirm={() => clearAllMutation.mutate()}
          onCancel={() => setClearAllOpen(false)}
          confirmClassName="bg-red-500 hover:bg-red-600"
        />
      </Wrapper>
    </div>
  );
}
