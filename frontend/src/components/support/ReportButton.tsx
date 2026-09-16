import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  X,
  Send,
  CheckCircle2,
} from "lucide-react";
import { supportApi } from "../../api/api";
import { SupportType } from "../../types";

const TYPES: { value: string; label: string }[] = [
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature" },
  { value: "account", label: "Account" },
  { value: "billing", label: "Billing" },
  { value: "performance", label: "Performance" },
  { value: "ui", label: "UI / Design" },
  { value: "security", label: "Security" },
  { value: "other", label: "Other" },
];

const ReportButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<SupportType>("bug");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const reset = () => {
    setType("bug");
    setTitle("");
    setMessage("");
    setError("");
    setDone(false);
  };

  useEffect(() => {
    const handleOpen = () => {
      setDone(false);
      setOpen(true);
    };
    window.addEventListener("open-report-modal", handleOpen);
    return () => window.removeEventListener("open-report-modal", handleOpen);
  }, []);

  const close = () => {
    setOpen(false);
    reset();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError("Please fill in the title and description.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await supportApi.create({
        type,
        title: title.trim(),
        message: message.trim(),
      });
      setDone(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to submit. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div
            className="absolute inset-0 bg-stone-950/50 backdrop-blur-[2px]"
            onClick={close}
          />
          <div className="relative w-full md:max-w-md bg-white dark:bg-stone-900 border-t md:border border-stone-200 dark:border-stone-800 rounded-t-2xl md:rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={close}
              className="font-plex absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {done ? (
              <div className="text-center py-8">
                <span className="w-14 h-14 mx-auto flex items-center justify-center rounded-2xl bg-lime-100 dark:bg-lime-400/10 text-lime-600 dark:text-lime-300 mb-4">
                  <CheckCircle2 className="w-7 h-7" />
                </span>
                <h3 className="font-fraunces text-xl font-normal text-stone-900 dark:text-stone-50">
                  Report Submitted
                </h3>
                <p className="font-plex mt-2 text-sm text-stone-500 dark:text-stone-400">
                  Thank you! Your report has been sent to our team. You can
                  track its status from My Reports.
                </p>
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Link
                    to="/my-reports"
                    onClick={close}
                    className="font-plex inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 dark:bg-lime-300 dark:text-stone-900 dark:hover:bg-lime-200 text-sm font-semibold transition-colors"
                  >
                    My Reports
                  </Link>
                  <button
                    type="button"
                    onClick={close}
                    className="font-plex px-5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 text-sm font-semibold transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <span className="w-14 h-14 mx-auto flex items-center justify-center rounded-2xl bg-stone-900 dark:bg-lime-300 text-lime-300 dark:text-stone-900 mb-4">
                    <MessageSquare className="w-6 h-6" />
                  </span>
                  <h3 className="font-fraunces text-xl font-normal text-stone-900 dark:text-stone-50">
                    Report a Problem
                  </h3>
                  <p className="font-plex mt-1 text-sm text-stone-500 dark:text-stone-400">
                    Tell us what went wrong — we'll fix it.
                  </p>
                </div>

                <form onSubmit={submit} className="space-y-5 mt-6">
                  <div>
                    <label className="font-plex block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                      Problem type
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {TYPES.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setType(t.value as SupportType)}
                          className={`font-plex px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                            type === t.value
                              ? "bg-stone-900 dark:bg-lime-300 text-white dark:text-stone-900 border-stone-900 dark:border-lime-300"
                              : "bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-300 dark:border-stone-600 hover:border-stone-500 dark:hover:border-stone-400"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-plex block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Short summary of the problem"
                      maxLength={255}
                      className="font-plex w-full px-3.5 py-2.5 border border-stone-300 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-lime-300 focus:border-transparent bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="font-plex block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us what happened and what you expected..."
                      rows={4}
                      className="font-plex w-full px-3.5 py-2.5 border border-stone-300 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-lime-300 focus:border-transparent resize-none bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 transition-all"
                    />
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
                    {submitting ? "Submitting..." : "Submit Report"}
                  </button>

                  <Link
                    to="/my-reports"
                    onClick={close}
                    className="font-plex block text-center text-sm text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
                  >
                    View my reports
                  </Link>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        .font-fraunces { font-family: 'Fraunces', serif; }
        .font-plex { font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>
    </>
  );
};

export default ReportButton;