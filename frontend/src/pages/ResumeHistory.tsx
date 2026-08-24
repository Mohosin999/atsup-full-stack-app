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
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResumes, setTotalResumes] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [duplicateId, setDuplicateId] = useState<string | null>(null);
  const [clearAllOpen, setClearAllOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  const fetchResumes = async (pageNum: number = 1) => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }
      if (resumes.length === 0) {
        setLoading(true);
      }
      const response = await resumeApi.getAll(pageNum, 10, "builder");
      const items = response.data.data || [];
      setResumes(items);
      setTotalPages(response.data.pagination?.pages || 1);
      setTotalResumes(response.data.pagination?.total || items.length);
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
    fetchResumes();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await resumeApi.delete(id);
      toast.success("Resume deleted");
      fetchResumes(resumes.length === 1 && page > 1 ? page - 1 : page);
    } catch {
      toast.error("Failed to delete resume");
    }
    setDeleteId(null);
  };

  const handleRename = async (id: string) => {
    if (!editValue.trim()) return;
    try {
      const resume = resumes.find((r) => r.id === id);
      await resumeApi.update(id, {
        metadata: {
          ...resume?.metadata,
          originalName: editValue.trim(),
        },
      });
      setResumes((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                metadata: { ...r.metadata, originalName: editValue.trim() },
              }
            : r,
        ),
      );
      setEditingId(null);
    } catch {
      toast.error("Failed to rename");
    }
  };

  const handleClearAll = async () => {
    try {
      await resumeApi.deleteAll();
      toast.success("All resumes deleted");
      setResumes([]);
      setPage(1);
      setTotalPages(1);
      setTotalResumes(0);
    } catch {
      toast.error("Failed to delete resumes");
    }
    setClearAllOpen(false);
  };

  const handleDuplicate = async (id: string) => {
    try {
      await resumeApi.duplicate(id);
      toast.success("Resume duplicated");
      fetchResumes(page);
    } catch {
      toast.error("Failed to duplicate resume");
    }
    setDuplicateId(null);
  };

  const getResumeTitle = (resume: ResumeListItem) =>
    resume.metadata?.originalName?.trim() ||
    resume.content?.personalInfo?.jobTitle?.trim() ||
    resume.content?.personalInfo?.fullName?.trim() ||
    "Untitled Resume";

  return (
    <div className="min-h-screen bg-[#F6F9FC] pb-12">
      <Wrapper>
        <div>
          {/* Header */}
          <div className="flex flex-col md:flex-row my-3 justify-between items-start md:items-center gap-3 md:gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                Resume History{" "}
                <span className="text-sm !font-normal text-gray-500">
                  - {totalResumes} resume{totalResumes !== 1 ? "s" : ""}
                </span>
              </h1>
            </div>

            <div className="flex items-center">
              {totalResumes > 0 && (
                <button
                  onClick={() => setClearAllOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-500/20 border border-red-500/30 text-red-600 hover:bg-red-500/30 transition-colors"
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
              <div className="bg-white hidden md:block border border-gray-300 overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#A5D9FC] border-b border-[#A5D9FC] text-left">
                      <th className="px-3 lg:px-5 py-2.5 lg:py-3 font-medium text-sm text-gray-700 w-[45%]">
                        Name
                      </th>
                      <th className="px-3 lg:px-5 py-2.5 lg:py-3 font-medium text-sm text-gray-700 w-[25%]">
                        Date
                      </th>
                      <th className="px-3 lg:px-5 py-2.5 lg:py-3 font-medium text-sm text-gray-700 w-[30%]"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {resumes.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-16 lg:py-24 text-center text-sm text-gray-500"
                        >
                          No Resumes Yet
                        </td>
                      </tr>
                    ) : (
                      resumes.map((resume) => (
                        <tr
                          key={resume.id}
                          className="border-b border-gray-300 last:border-b-0"
                        >
                          <td className="px-3 lg:px-5 py-4 lg:py-5">
                            {editingId === resume.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  ref={inputRef}
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() => handleRename(resume.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      handleRename(resume.id);
                                    if (e.key === "Escape") setEditingId(null);
                                  }}
                                  autoFocus
                                   className="bg-transparent border border-gray-300 px-2 py-1 text-gray-700 text-sm focus:outline-none"
                                />
                                <span
                                  ref={measureRef}
                                  className="absolute invisible whitespace-pre text-sm"
                                >
                                  {editValue}
                                </span>
                                <button onClick={() => handleRename(resume.id)}>
                                  <Check className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-green-600" />
                                </button>

                                <button onClick={() => setEditingId(null)}>
                                  <X className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-red-500" />
                                </button>
                              </div>
                            ) : (
                              <div className="group flex items-center gap-2">
                                <span className="text-gray-700 text-sm">
                                  {getResumeTitle(resume)}
                                </span>

                                <button
                                  onClick={() => {
                                    setEditingId(resume.id);
                                    setEditValue(getResumeTitle(resume));
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition"
                                >
                                  <Pencil className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-gray-500 hover:text-cyan-500" />
                                </button>
                              </div>
                            )}
                          </td>

                          <td className="px-3 lg:px-0 py-4 lg:py-5 text-gray-700 text-sm">
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
                            <div className="flex justify-end gap-3 lg:gap-5 text-sm text-gray-700">
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
              <div className="bg-white md:hidden border border-gray-300 overflow-hidden divide-y divide-gray-200">
                {resumes.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-500">
                    No Resumes Yet
                  </div>
                ) : (
                  resumes.map((resume) => (
                    <div key={resume.id} className="p-3">
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0 flex-1">
                          {editingId === resume.id ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <input
                                ref={inputRef}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => handleRename(resume.id)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    handleRename(resume.id);
                                  if (e.key === "Escape") setEditingId(null);
                                }}
                                autoFocus
                                className="bg-transparent border border-gray-300 px-2 py-1 text-gray-700 text-sm w-full"
                              />
                              <span
                                ref={measureRef}
                                className="absolute invisible whitespace-pre text-sm"
                              >
                                {editValue}
                              </span>
                              <button onClick={() => handleRename(resume.id)}>
                                <Check className="w-4 h-4 text-green-600" />
                              </button>

                              <button onClick={() => setEditingId(null)}>
                                <X className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          ) : (
                            <div className="group flex items-center gap-2">
                              <h3 className="text-sm truncate text-gray-700">
                                {getResumeTitle(resume)}
                              </h3>

                              <button
                                onClick={() => {
                                  setEditingId(resume.id);
                                  setEditValue(getResumeTitle(resume));
                                }}
                                className="opacity-70"
                              >
                                <Pencil className="w-3.5 h-3.5 text-gray-500" />
                              </button>
                            </div>
                          )}

                          <p className="mt-1.5 text-xs text-gray-500">
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

                      <div className="flex items-center justify-end gap-4 mt-3 text-xs text-gray-700">
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
                    onPageChange={fetchResumes}
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
          onConfirm={() => deleteId && handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
          confirmClassName="bg-red-500 hover:bg-red-600"
        />

        <ConfirmModal
          isOpen={!!duplicateId}
          title="Duplicate Resume"
          message="Are you sure you want to duplicate this resume?"
          confirmText="Duplicate"
          cancelText="Cancel"
          onConfirm={() => duplicateId && handleDuplicate(duplicateId)}
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
          onConfirm={handleClearAll}
          onCancel={() => setClearAllOpen(false)}
          confirmClassName="bg-red-500 hover:bg-red-600"
        />
      </Wrapper>
    </div>
  );
}
