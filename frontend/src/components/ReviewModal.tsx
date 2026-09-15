import React, { useState } from "react";
import { Star, Send, X } from "lucide-react";
import { reviewApi } from "../api/api";
import { toast } from "react-toastify";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setRating(0);
    setHoverRating(0);
    setMessage("");
    setError("");
  };

  const close = () => {
    onClose();
    setTimeout(reset, 200);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (!message.trim()) {
      setError("Please write a short message.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await reviewApi.submit({ rating, message: message.trim() });
      toast.success("Thank you for your review!");
      close();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to submit. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const ratingLabel =
    rating === 1
      ? "Poor"
      : rating === 2
        ? "Fair"
        : rating === 3
          ? "Good"
          : rating === 4
            ? "Very Good"
            : rating === 5
              ? "Excellent"
              : "";

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-stone-950/50 backdrop-blur-[2px]" onClick={close} />
      <div className="relative w-full md:max-w-md bg-white dark:bg-stone-900 border-t md:border border-stone-200 dark:border-stone-800 rounded-t-2xl md:rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={close}
          className="font-plex absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center">
          <h3 className="font-fraunces mt-4 text-xl font-normal text-stone-900 dark:text-stone-50">
            Rate your experience
          </h3>
          <p className="font-plex mt-1 text-sm text-stone-500 dark:text-stone-400">
            Your feedback helps us shape the roadmap.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5 mt-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                  aria-label={`${star} star${star > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-stone-300 dark:text-stone-600"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="font-plex mt-2 text-sm font-medium text-amber-600 dark:text-amber-300">
                {ratingLabel}
              </p>
            )}
          </div>

          <div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you think — what you loved, or what we can improve..."
              rows={4}
              maxLength={1000}
              className="font-plex w-full px-3.5 py-2.5 border border-stone-300 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-lime-300 focus:border-transparent resize-none bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500"
            />
            <p className="font-plex text-xs text-stone-400 dark:text-stone-500 mt-1 text-right">
              {message.length}/1000
            </p>
          </div>

          {error && (
            <p className="font-plex text-sm text-red-600 dark:text-red-400 text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="font-plex w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl bg-stone-900 text-white hover:bg-stone-800 dark:bg-lime-300 dark:text-stone-900 dark:hover:bg-lime-200 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        .font-fraunces { font-family: 'Fraunces', serif; }
        .font-plex { font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>
    </div>
  );
};

export default ReviewModal;