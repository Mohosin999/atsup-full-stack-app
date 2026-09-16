import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Trash2, CheckCircle, MessageSquare } from "lucide-react";
import { adminReviewApi } from "../../api/api";
import LoadingSpinner from "../ui/LoadingSpinner";
import ConfirmModal from "../ui/ConfirmModal";
import AdminViewHeader from "./AdminViewHeader";

interface ReviewUser {
  id: string;
  name: string;
  email: string;
  picture: string | null;
}

interface Review {
  id: string;
  userId: string;
  rating: number;
  message: string;
  showOnHome: boolean;
  createdAt: string;
  user: ReviewUser;
}

export default function ReviewManagement({
  onRefresh,
  isRefreshing,
}: {
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [clearAllOpen, setClearAllOpen] = useState(false);

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const res = await adminReviewApi.getAll();
      return res.data.success ? res.data.data : [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminReviewApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      setDeleteId(null);
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: () => adminReviewApi.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      setClearAllOpen(false);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminReviewApi.toggleHome(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="md" text="Loading reviews..." />
      </div>
    );
  }

  return (
    <>
      <AdminViewHeader
        title="Reviews"
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />

      {reviews.length > 0 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setClearAllOpen(true)}
            className="font-plex inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl text-center py-16 text-stone-500 dark:text-stone-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-stone-300 dark:text-stone-600" />
          <p>No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`bg-white dark:bg-stone-900 border rounded-2xl shadow-xl p-5 transition-colors ${
                review.showOnHome
                  ? "border-lime-400 dark:border-lime-400 bg-lime-50/40 dark:bg-lime-400/5"
                  : "border-stone-200 dark:border-stone-800"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-stone-900 dark:bg-lime-300 text-lime-300 dark:text-stone-900 flex items-center justify-center text-white dark:text-stone-900 font-bold text-sm flex-shrink-0">
                    {review.user.name?.charAt(0) || "?"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-stone-800 dark:text-stone-100 text-sm">
                        {review.user.name || "Anonymous"}
                      </p>
                      <span className="text-xs text-stone-400 dark:text-stone-500">
                        {review.user.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < review.rating
                              ? "fill-amber-400 text-amber-500"
                              : "text-stone-300 dark:text-stone-600"
                          }`}
                        />
                      ))}
                      <span className="text-xs text-stone-400 dark:text-stone-500 ml-1">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
                      {review.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleMutation.mutate(review.id)}
                    title={review.showOnHome ? "Remove from homepage" : "Show on homepage"}
                    className={`p-2 rounded-lg border transition-colors ${
                      review.showOnHome
                        ? "bg-lime-100 dark:bg-lime-400/20 border-lime-300 dark:border-lime-400 text-lime-700 dark:text-lime-300 hover:bg-lime-200"
                        : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-600 text-stone-400 dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-lime-600 dark:hover:text-lime-300"
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(review.id)}
                    title="Delete review"
                    className="p-2 rounded-lg border border-stone-200 dark:border-stone-600 text-stone-400 dark:text-stone-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-200 dark:hover:border-red-500/50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete single review */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Review"
        message="Are you sure you want to delete this review?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        type="danger"
      />

      {/* Clear all reviews */}
      <ConfirmModal
        isOpen={clearAllOpen}
        title="Clear All Reviews"
        message="Are you sure you want to delete all reviews? This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        onConfirm={() => clearAllMutation.mutate()}
        onCancel={() => setClearAllOpen(false)}
        type="danger"
      />
    </>
  );
}
