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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
            >
              Clear All
            </button>
          </>
        }
      />

      {resumes.length === 0 ? (
        <div className="bg-white box-shadow p-6 text-center py-16 text-gray-500">No resumes found.</div>
      ) : (
        <div className="bg-white box-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Resume</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {resumes.map((resume) => (
                  <tr key={resume.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-gray-800 truncate max-w-[200px]">
                          {getFileName(resume.metadata)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-gray-800 font-medium">{resume.user.name || "—"}</p>
                        <p className="text-gray-500 text-xs">{resume.user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                        {resume.sourceType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setConfirmDelete(resume)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
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
