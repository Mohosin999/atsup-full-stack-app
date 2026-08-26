import React, { useState } from "react";
import { Trash2, ClipboardCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/api";
import LoadingSpinner from "../ui/LoadingSpinner";
import ConfirmModal from "../ui/ConfirmModal";
import AdminViewHeader from "./AdminViewHeader";

interface AdminAtsScore {
  id: string;
  title: string;
  resumeName: string;
  overallScore: number;
  atsFriendliness: number;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600 bg-green-50";
  if (score >= 60) return "text-yellow-600 bg-yellow-50";
  return "text-red-600 bg-red-50";
};

const AllAtsScores: React.FC<{ onRefresh?: () => void; isRefreshing?: boolean }> = ({ onRefresh, isRefreshing }) => {
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<AdminAtsScore | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  const { data: scores = [], isLoading: loading } = useQuery<AdminAtsScore[]>({
    queryKey: ["admin-all-ats-scores"],
    queryFn: async () => {
      const res = await api.get("/admin-dashboard/ats-scores");
      return res.data.success ? res.data.data : [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin-dashboard/ats-scores/${id}`),
    onSuccess: (_, id) => {
      queryClient.setQueryData(["admin-all-ats-scores"], (old: AdminAtsScore[] | undefined) =>
        (old || []).filter((s) => s.id !== id)
      );
      setConfirmDelete(null);
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => api.delete("/admin-dashboard/ats-scores"),
    onSuccess: () => {
      queryClient.setQueryData(["admin-all-ats-scores"], []);
      setConfirmDeleteAll(false);
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner text="Loading ATS scores..." />
      </div>
    );
  }

  return (
    <div>
      <AdminViewHeader
        title="Total ATS Check"
        count={scores.length}
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

      {scores.length === 0 ? (
        <div className="bg-white box-shadow p-6 text-center py-16 text-gray-500">No ATS scores found.</div>
      ) : (
        <div className="bg-white box-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">ATS Friendliness</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {scores.map((score) => (
                  <tr key={score.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ClipboardCheck className="w-4 h-4 text-gray-400 shrink-0" />
                        <div>
                          <p className="text-gray-800 font-medium truncate max-w-[180px]">{score.title}</p>
                          <p className="text-gray-500 text-xs truncate max-w-[180px]">{score.resumeName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-gray-800 font-medium">{score.user.name || "—"}</p>
                        <p className="text-gray-500 text-xs">{score.user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded ${getScoreColor(score.overallScore)}`}>
                        {score.overallScore}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded ${getScoreColor(score.atsFriendliness)}`}>
                        {score.atsFriendliness}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(score.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setConfirmDelete(score)}
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
        title="Delete ATS Score"
        message="Are you sure you want to delete this ATS score? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => {
          if (confirmDelete) deleteMutation.mutate(confirmDelete.id);
        }}
        onCancel={() => setConfirmDelete(null)}
      />

      <ConfirmModal
        isOpen={confirmDeleteAll}
        title="Clear All ATS Scores"
        message={`Are you sure you want to clear ALL ${scores.length} ATS scores? This will permanently delete them from the database. This action cannot be undone.`}
        confirmText="Clear All"
        onConfirm={() => deleteAllMutation.mutate()}
        onCancel={() => setConfirmDeleteAll(false)}
      />
    </div>
  );
};

export default AllAtsScores;
