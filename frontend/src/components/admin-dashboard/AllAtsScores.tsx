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
  if (score >= 80) return "bg-emerald-50 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-400/20";
  if (score >= 60) return "bg-amber-50 dark:bg-amber-400/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-400/20";
  return "bg-red-50 dark:bg-red-400/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20";
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
              disabled={scores.length === 0}
              className="font-plex inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-400/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </>
        }
      />

      {scores.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl p-6 text-center py-16 text-stone-500 dark:text-stone-400">
          <ClipboardCheck className="w-10 h-10 mx-auto mb-2 text-stone-300 dark:text-stone-600" />
          No ATS scores found.
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 text-left text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Title</th>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Score</th>
                  {/* <th className="px-5 py-3.5">ATS Friendliness</th> */}
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {scores.map((score) => (
                  <tr key={score.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-stone-900 dark:bg-lime-300 text-lime-300 dark:text-stone-900 flex items-center justify-center shrink-0">
                          <ClipboardCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-stone-800 dark:text-stone-100 font-medium truncate max-w-[180px]">{score.title}</p>
                          <p className="text-stone-500 dark:text-stone-400 text-xs truncate max-w-[180px]">{score.resumeName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-stone-800 dark:text-stone-100 font-medium">{score.user.name || "—"}</p>
                        <p className="text-stone-500 dark:text-stone-400 text-xs">{score.user.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`font-plex inline-flex px-2.5 py-0.5 text-xs font-bold rounded-full ${getScoreColor(score.overallScore)}`}>
                        {score.overallScore}%
                      </span>
                    </td>
                    {/* <td className="px-5 py-3.5">
                      <span className={`font-plex inline-flex px-2.5 py-0.5 text-xs font-bold rounded-full ${getScoreColor(score.atsFriendliness)}`}>
                        {score.atsFriendliness}%
                      </span>
                    </td> */}
                    <td className="px-5 py-3.5 text-stone-500 dark:text-stone-400 text-xs whitespace-nowrap">
                      {new Date(score.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setConfirmDelete(score)}
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
