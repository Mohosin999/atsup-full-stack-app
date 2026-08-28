import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  FileText,
  Trash2,
  Pencil,
  Copy,
  Check,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resumeApi } from "../api/api";
import { ResumeContent } from "../types";
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

export default function ResumeHistory() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [duplicateId, setDuplicateId] = useState<string | null>(null);
  const [clearAllOpen, setClearAllOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  const { data, isLoading: loading } = useQuery({
    queryKey: ["resumes", user?._id, page],
    queryFn: async () => {
      if (!user) return { data: [], pagination: { pages: 1, total: 0 } };
      const res = await resumeApi.getAll(page, 7, "builder");
      return {
        data: res.data.data || [],
        pagination: res.data.pagination || { pages: 1, total: 0 },
      };
    },
    enabled: !!user,
    placeholderData: (prev) => prev,
  });

  const resumes = data?.data || [];
  const totalPages = data?.pagination?.pages || 1;
  const totalResumes = data?.pagination?.total || 0;

  useEffect(() => {
    if (editingId && inputRef.current && measureRef.current) {
      const textWidth = measureRef.current.offsetWidth;
      inputRef.current.style.width = `${Math.min(textWidth + 20, 480)}px`;
    }
  }, [editValue, editingId]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => resumeApi.delete(id),
    onSuccess: () => {
      toast.success("Resume deleted");
      queryClient.invalidateQueries({ queryKey: ["resumes", user?._id] });
      if (resumes.length === 1 && page > 1) setPage(page - 1);
    },
    onError: () => toast.error("Failed to delete resume"),
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      resumeApi.update(id, {
        metadata: {
          ...resumes.find((r: ResumeListItem) => r.id === id)?.metadata,
          originalName: name,
        },
      }),
    onSuccess: (_, variables) => {
      queryClient.setQueryData(["resumes", user?._id, page], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((r: ResumeListItem) =>
            r.id === variables.id
              ? {
                  ...r,
                  metadata: { ...r.metadata, originalName: variables.name },
                }
              : r,
          ),
        };
      });
      setEditingId(null);
    },
    onError: () => toast.error("Failed to rename"),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => resumeApi.duplicate(id),
    onSuccess: () => {
      toast.success("Resume duplicated");
      queryClient.invalidateQueries({ queryKey: ["resumes", user?._id] });
    },
    onError: () => toast.error("Failed to duplicate resume"),
  });

  const clearAllMutation = useMutation({
    mutationFn: () => resumeApi.deleteAll(),
    onSuccess: () => {
      toast.success("All resumes deleted");
      queryClient.invalidateQueries({ queryKey: ["resumes", user?._id] });
      setPage(1);
      setClearAllOpen(false);
    },
    onError: () => toast.error("Failed to delete resumes"),
  });

  const getResumeTitle = (resume: ResumeListItem) =>
    resume.metadata?.originalName?.trim() ||
    resume.content?.personalInfo?.jobTitle?.trim() ||
    resume.content?.personalInfo?.fullName?.trim() ||
    "Untitled Resume";

  return (
    <div className="min-h-screen lg:pt-20 pb-12">
      <Wrapper>
        <div>
          {/* Header */}
          <div className="pt-8 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100">
                Resume History{" "}
                <span className="text-sm !font-normal text-gray-500 dark:text-gray-400">
                  - {totalResumes} resume{totalResumes !== 1 ? "s" : ""}
                </span>
              </h1>
            </div>

            <div className="flex items-center">
              {totalResumes > 0 && (
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
            <div className="flex justify-center py-12 md:py-16 lg:py-20">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block dark:bg-secondary border border-gray-300 overflow-hidden rounded-lg dark:border-gray-600">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#A5D9FC] dark:bg-accent border-b border-[#A5D9FC] dark:border-accent text-left">
                      <th className="px-3 lg:px-5 py-2.5 lg:py-3 font-medium text-sm text-gray-700 dark:text-gray-300 w-[45%]">
                        Name
                      </th>
                      <th className="px-3 lg:px-5 py-2.5 lg:py-3 font-medium text-sm text-gray-700 dark:text-gray-300 w-[25%]">
                        Date
                      </th>
                      <th className="px-3 lg:px-5 py-2.5 lg:py-3 font-medium text-sm text-gray-700 dark:text-gray-300 w-[30%]"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {resumes.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-16 lg:py-24 text-center text-sm text-gray-500 dark:text-gray-400"
                        >
                          No Resumes Yet
                        </td>
                      </tr>
                    ) : (
                      resumes.map((resume: ResumeListItem) => (
                        <tr
                          key={resume.id}
                          className="border-b border-gray-300 last:border-b-0 dark:border-gray-600"
                        >
                          <td className="px-3 lg:px-5 py-4 lg:py-5">
                            {editingId === resume.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  ref={inputRef}
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() =>
                                    renameMutation.mutate({
                                      id: resume.id,
                                      name: editValue.trim(),
                                    })
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      renameMutation.mutate({
                                        id: resume.id,
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
                                      id: resume.id,
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
                                  {getResumeTitle(resume)}
                                </span>

                                <button
                                  onClick={() => {
                                    setEditingId(resume.id);
                                    setEditValue(getResumeTitle(resume));
                                  }}
                                   className="transition"
                                >
                                  <Pencil className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-gray-500 dark:text-gray-400 hover:text-cyan-500" />
                                </button>
                              </div>
                            )}
                          </td>

                          <td className="px-3 lg:px-0 py-4 lg:py-5 text-gray-700 dark:text-gray-300 text-sm">
                            {new Date(resume.updatedAt).toLocaleDateString(
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
                                onClick={() =>
                                  navigate(`/resume-builder/${resume.id}`)
                                }
                                className="hover:text-cyan-600 transition"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setDuplicateId(resume.id)}
                                className="hover:text-blue-600 transition"
                              >
                                <Copy className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setDeleteId(resume.id)}
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

              {/* Mobile Layout */}
                <div className="bg-white md:hidden border border-gray-300 overflow-hidden divide-y divide-gray-200 dark:bg-gray-800 dark:border-gray-600 dark:divide-gray-700">
                {resumes.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    No Resumes Yet
                  </div>
                ) : (
                  resumes.map((resume: ResumeListItem) => (
                    <div key={resume.id} className="p-3">
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0 flex-1">
                          {editingId === resume.id ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <input
                                ref={inputRef}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() =>
                                  renameMutation.mutate({
                                    id: resume.id,
                                    name: editValue.trim(),
                                  })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    renameMutation.mutate({
                                      id: resume.id,
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
                                    id: resume.id,
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
                                {getResumeTitle(resume)}
                              </h3>

                              <button
                                onClick={() => {
                                  setEditingId(resume.id);
                                  setEditValue(getResumeTitle(resume));
                                }}
                                className="opacity-70"
                              >
                                <Pencil className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                              </button>
                            </div>
                          )}

                          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                            {new Date(resume.updatedAt).toLocaleDateString(
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

                      <div className="flex items-center justify-end gap-4 mt-3 text-xs text-gray-700 dark:text-gray-300">
                        <button
                          onClick={() =>
                            navigate(`/resume-builder/${resume.id}`)
                          }
                          className="hover:text-cyan-600 transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDuplicateId(resume.id)}
                          className="hover:text-blue-600 transition"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteId(resume.id)}
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
          title="Delete Resume"
          message="Are you sure you want to delete this resume? This action cannot be undone."
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
          isOpen={!!duplicateId}
          title="Duplicate Resume"
          message="Are you sure you want to duplicate this resume?"
          confirmText="Duplicate"
          cancelText="Cancel"
          onConfirm={() => {
            if (duplicateId) duplicateMutation.mutate(duplicateId);
            setDuplicateId(null);
          }}
          onCancel={() => setDuplicateId(null)}
          type="info"
          confirmClassName="bg-cyan-500 hover:bg-cyan-600"
        />

        <ConfirmModal
          isOpen={clearAllOpen}
          title="Clear All History"
          message="This will permanently delete all your resumes. This action cannot be undone."
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
