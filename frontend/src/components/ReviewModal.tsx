import React, { useState } from "react";
import { Star, Send } from "lucide-react";
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

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      <div className="relative w-full md:max-w-md bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-t-xl md:rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 text-center mb-4">
          How would you rate this app?
        </h3>

        <form onSubmit={submit} className="space-y-5">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-0.5 transition-colors"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {rating === 1
                  ? "Poor"
                  : rating === 2
                    ? "Fair"
                    : rating === 3
                      ? "Good"
                      : rating === 4
                        ? "Very Good"
                        : "Excellent"}
              </p>
            )}
          </div>

          <div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you think, what can be improved, or what you loved..."
              rows={4}
              maxLength={1000}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-right">
              {message.length}/1000
            </p>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg bg-cyan-600 text-white hover:bg-cyan-600/90 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
