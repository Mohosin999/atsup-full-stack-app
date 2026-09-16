import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Trash2, Pencil, Copy, Check, X, FilePlus2, Sparkles, LayoutList } from "lucide-react";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resumeApi } from "../api/api";
import { ResumeContent } from "../types";
import { useAppSelector } from "@/hooks";
import Wrapper from "../components/Wrapper";
import Pagination from "../components/ui/Pagination";
import ConfirmModal from "../components/ui/ConfirmModal";
import SkeletonHistory from "@/components/ui/SkeletonHistory";

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
              ? { ...r, metadata: { ...r.metadata, originalName: variables.name } }
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
    resume.content?.personalInfo?.jobTitle?.trim() ||
    resume.metadata?.originalName?.trim() ||
    resume.content?.personalInfo?.fullName?.trim() ||
    "Untitled Resume";

  const getResumeSubtitle = (resume: ResumeListItem) =>
    [resume.content?.personalInfo?.fullName?.trim(), resume.content?.personalInfo?.contact?.email?.trim()]
      .filter(Boolean)
      .join(" · ") || "No details yet";

  return (
    <div className="min-h-screen pt-8 lg:pt-32 pb-10 md:pb-12 bg-stone-50 dark:bg-stone-950">
      <Wrapper>
        <div className="pt-8 lg:pt-0 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            {/* <span className="font-plex inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-lime-50 text-lime-800 border border-lime-300 dark:bg-lime-400/10 dark:text-lime-200 dark:border-lime-400/20">
              <LayoutList className="w-3.5 h-3.5" />
              Builder history
            </span> */}
            <h1 className="font-fraunces text-2xl md:text-3xl font-normal text-stone-900 dark:text-stone-50">
              Resume history
            </h1>
            <p className="font-plex mt-1 text-sm text-stone-500 dark:text-stone-400">
              All resumes built in the builder — edit, duplicate, or delete any time.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate("/resume-builder/new")}
              className="font-plex inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900 dark:bg-lime-300 text-white dark:text-stone-900 text-sm font-semibold hover:bg-stone-800 dark:hover:bg-lime-200 transition-colors"
            >
              <FilePlus2 className="w-4 h-4" />
              New resume
            </button>
            {totalResumes > 0 && (
              <button
                onClick={() => setClearAllOpen(true)}
                className="font-plex inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white dark:bg-stone-900 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear all
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <SkeletonHistory />
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden box-shadow">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-stone-100 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-800 text-left">
                      <th className="font-plex px-5 py-3.5 text-xs font-semibold tracking-wide uppercase text-stone-500 dark:text-stone-400 w-[45%]">
                        Resume
                      </th>
                      <th className="font-plex px-5 py-3.5 text-xs font-semibold tracking-wide uppercase text-stone-500 dark:text-stone-400 w-[25%]">
                        Last edited
                      </th>
                      <th className="px-5 py-3.5 w-[30%]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {resumes.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-20 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                              <FileText className="w-6 h-6 text-stone-400" />
                            </div>
                            <p className="font-plex text-sm font-medium text-stone-700 dark:text-stone-300">No resumes yet</p>
                            <p className="font-plex text-xs text-stone-500 dark:text-stone-400 max-w-sm">
                              Create your first ATS resume — it will appear here for quick access.
                            </p>
                            <button
                              onClick={() => navigate("/resume-builder/new")}
                              className="font-plex mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-stone-900 dark:bg-lime-300 text-white dark:text-stone-900 text-sm font-semibold hover:bg-stone-800 dark:hover:bg-lime-200 transition-colors"
                            >
                              <FilePlus2 className="w-4 h-4" />
                              Create resume
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      resumes.map((resume: ResumeListItem) => (
                        <tr key={resume.id} className="group hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                          <td className="px-5 py-4">
                            {editingId === resume.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  ref={inputRef}
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() => renameMutation.mutate({ id: resume.id, name: editValue.trim() })}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") renameMutation.mutate({ id: resume.id, name: editValue.trim() });
                                    if (e.key === "Escape") setEditingId(null);
                                  }}
                                  autoFocus
                                  className="font-plex bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-lg px-2.5 py-1.5 text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-lime-300 focus:border-transparent"
                                />
                                <span ref={measureRef} className="absolute invisible whitespace-pre text-sm font-plex">
                                  {editValue}
                                </span>
                                <button
                                  onClick={() => renameMutation.mutate({ id: resume.id, name: editValue.trim() })}
                                  className="p-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button onClick={() => setEditingId(null)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center shrink-0">
                                  <FileText className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-plex text-sm font-medium text-stone-800 dark:text-stone-100 truncate">
                                      {getResumeTitle(resume)}
                                    </span>
                                    <button
                                      onClick={() => {
                                        setEditingId(resume.id);
                                        setEditValue(getResumeTitle(resume));
                                      }}
                                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-all shrink-0"
                                    >
                                      <Pencil className="w-3.5 h-3.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200" />
                                    </button>
                                  </div>
                                  <p className="font-plex text-xs text-stone-500 dark:text-stone-400 truncate">{getResumeSubtitle(resume)}</p>
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="font-plex px-5 py-4 text-sm text-stone-600 dark:text-stone-400">
                            {new Date(resume.updatedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => navigate(`/resume-builder/${resume.id}`)}
                                className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDuplicateId(resume.id)}
                                className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                                title="Duplicate"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteId(resume.id)}
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
              {resumes.length === 0 ? (
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-8 text-center shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6 text-stone-400" />
                  </div>
                  <p className="font-plex mt-3 text-sm font-medium text-stone-700 dark:text-stone-300">No resumes yet</p>
                  <p className="font-plex mt-1 text-xs text-stone-500 dark:text-stone-400">Create one to see it here.</p>
                  <button
                    onClick={() => navigate("/resume-builder/new")}
                    className="font-plex mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-stone-900 dark:bg-lime-300 text-white dark:text-stone-900 text-sm font-semibold"
                  >
                    <FilePlus2 className="w-4 h-4" /> Create resume
                  </button>
                </div>
              ) : (
                resumes.map((resume: ResumeListItem) => (
                  <div key={resume.id} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-sm">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-stone-500 dark:text-stone-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        {editingId === resume.id ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => renameMutation.mutate({ id: resume.id, name: editValue.trim() })}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") renameMutation.mutate({ id: resume.id, name: editValue.trim() });
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              autoFocus
                              className="font-plex flex-1 min-w-0 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-lg px-2.5 py-1.5 text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-lime-300"
                            />
                            <button onClick={() => renameMutation.mutate({ id: resume.id, name: editValue.trim() })} className="p-1 text-emerald-600">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1 text-red-500">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <h3 className="font-plex text-sm font-medium text-stone-800 dark:text-stone-100 truncate">
                                {getResumeTitle(resume)}
                              </h3>
                              <button
                                onClick={() => {
                                  setEditingId(resume.id);
                                  setEditValue(getResumeTitle(resume));
                                }}
                                className="p-1 shrink-0"
                              >
                                <Pencil className="w-3.5 h-3.5 text-stone-400" />
                              </button>
                            </div>
                            <p className="font-plex text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5">{getResumeSubtitle(resume)}</p>
                            <p className="font-plex text-xs text-stone-400 dark:text-stone-500 mt-1">
                              {new Date(resume.updatedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-1">
                      <button
                        onClick={() => navigate(`/resume-builder/${resume.id}`)}
                        className="p-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDuplicateId(resume.id)} className="p-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(resume.id)} className="p-2 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600">
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
          title="Delete resume?"
          message="Are you sure you want to delete this resume? This cannot be undone."
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
          title="Duplicate resume?"
          message="Are you sure you want to duplicate this resume?"
          confirmText="Duplicate"
          cancelText="Cancel"
          onConfirm={() => {
            if (duplicateId) duplicateMutation.mutate(duplicateId);
            setDuplicateId(null);
          }}
          onCancel={() => setDuplicateId(null)}
          type="info"
          confirmClassName="bg-stone-900 hover:bg-stone-800 dark:bg-lime-300 dark:hover:bg-lime-200 dark:text-stone-900"
        />

        <ConfirmModal
          isOpen={clearAllOpen}
          title="Clear all resumes?"
          message="This will permanently delete all your resumes. This cannot be undone."
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
