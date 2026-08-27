import React, { useState } from "react";
import { Star, X, Send, CheckCircle2 } from "lucide-react";
import { feedbackApi } from "../api/api";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const reset = () => {
    setRating(0);
    setHoverRating(0);
    setMessage("");
    setError("");
    setDone(false);
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
      await feedbackApi.submit({ rating, message: message.trim() });
      setDone(true);
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-xl sm:rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {done ? "Thank You!" : "Share Your Feedback"}
          </h3>
          <button
            type="button"
            onClick={close}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-cyan-500 mx-auto mb-3" />
            <p className="text-gray-700 mb-1">
              Thanks for your feedback! It helps us improve.
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-cyan-600 text-white hover:bg-cyan-700"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How would you rate your experience?
              </label>
              <div className="flex items-center gap-1">
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
                {rating > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    {rating === 1
                      ? "Poor"
                      : rating === 2
                        ? "Fair"
                        : rating === 3
                          ? "Good"
                          : rating === 4
                            ? "Very Good"
                            : "Excellent"}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your feedback
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you think, what can be improved, or what you loved..."
                rows={4}
                maxLength={1000}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none bg-white text-gray-700 placeholder-gray-400"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {message.length}/1000
              </p>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
