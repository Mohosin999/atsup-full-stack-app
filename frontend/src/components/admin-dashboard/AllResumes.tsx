import React, { useState } from "react";
import { Trash2, FileText } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/api";
import LoadingSpinner from "../ui/LoadingSpinner";
import ConfirmModal from "../ui/ConfirmModal";
import AdminViewHeader from "./AdminViewHeader";

interface AdminResume {
  id: string;
  sourceType: string;
  metadata: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; email: string };
}

const AllResumes: React.FC<{ onRefresh?: () => void; isRefreshing?: boolean }> = ({ onRefresh, isRefreshing }) => {
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<AdminResume | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  const { data: resumes = [], isLoading: loading } = useQuery<AdminResume[]>({
    queryKey: ["admin-all-resumes"],
    queryFn: async () => {
      const res = await api.get("/admin-dashboard/resumes");
      return res.data.success ? res.data.data : [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin-dashboard/resumes/${id}`),
    onSuccess: (_, id) => {
      queryClient.setQueryData(["admin-all-resumes"], (old: AdminResume[] | undefined) =>
        (old || []).filter((r) => r.id !== id)
      );
      setConfirmDelete(null);
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => api.delete("/admin-dashboard/resumes"),
    onSuccess: () => {
      queryClient.setQueryData(["admin-all-resumes"], []);
      setConfirmDeleteAll(false);
    },
  });

  const getFileName = (metadata: any) => {
    return metadata?.originalName || metadata?.filename || "Untitled";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner text="Loading resumes..." />
      </div>
    );
  }

  return (
    <div>
      <AdminViewHeader
        title="Total Resumes"
        count={resumes.length}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        rightActions={
          <>
            <button
              onClick={() => setConfirmDeleteAll(true)}
              disabled={resumes.length === 0}
              className="font-plex inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-400/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </>
        }
      />

      {resumes.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl p-6 text-center py-16 text-stone-500 dark:text-stone-400">
          <FileText className="w-10 h-10 mx-auto mb-2 text-stone-300 dark:text-stone-600" />
          No resumes found.
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 text-left text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Resume</th>
                  <th className="px-5 py-3.5">User</th>
                  {/* <th className="px-5 py-3.5">Source</th> */}
                  <th className="px-5 py-3.5">Created</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {resumes.map((resume) => (
                  <tr key={resume.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-stone-900 dark:bg-lime-300 text-lime-300 dark:text-stone-900 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-stone-800 dark:text-stone-100 font-medium truncate max-w-[220px]">
                          {getFileName(resume.metadata)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-stone-800 dark:text-stone-100 font-medium">{resume.user.name || "—"}</p>
                        <p className="text-stone-500 dark:text-stone-400 text-xs">{resume.user.email}</p>
                      </div>
                    </td>
                    {/* <td className="px-5 py-3.5">
                      <span className="font-plex inline-flex px-2.5 py-0.5 text-xs font-medium bg-lime-50 dark:bg-lime-400/10 text-lime-700 dark:text-lime-300 border border-lime-300 dark:border-lime-400/20 rounded-full">
                        {resume.sourceType}
                      </span>
                    </td> */}
                    <td className="px-5 py-3.5 text-stone-500 dark:text-stone-400 text-xs whitespace-nowrap">
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setConfirmDelete(resume)}
                        className="p-2 rounded-lg text-stone-400 dark:text-stone-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Delete Resume"
        message="Are you sure you want to delete this resume? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => {
          if (confirmDelete) deleteMutation.mutate(confirmDelete.id);
        }}
        onCancel={() => setConfirmDelete(null)}
      />

      <ConfirmModal
        isOpen={confirmDeleteAll}
        title="Clear All Resumes"
        message={`Are you sure you want to clear ALL ${resumes.length} resumes? This will permanently delete them from the database. This action cannot be undone.`}
        confirmText="Clear All"
        onConfirm={() => deleteAllMutation.mutate()}
        onCancel={() => setConfirmDeleteAll(false)}
      />
    </div>
  );
};

export default AllResumes;
