import React, { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { supportApi } from "../api/api";
import { SupportStatus, SupportTicket } from "../types";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Wrapper from "../components/Wrapper";

const STATUS_STYLES: Record<SupportStatus, string> = {
  open: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-400",
  "in-progress":
    "bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300",
  resolved:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-400",
};

const STATUS_LABELS: Record<SupportStatus, string> = {
  open: "Open",
  "in-progress": "In Progress",
  resolved: "Resolved",
};

const TYPE_LABELS: Record<string, string> = {
  bug: "Bug",
  feature: "Feature Request",
  other: "Other",
};

const MyReports: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supportApi
      .getMine()
      .then((res) => {
        if (res.data.success) setTickets(res.data.data);
      })
      .catch((err) => console.error("Failed to fetch reports:", err))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return "—";
    }
  };

  return (
    <div className="font-plex min-h-screen bg-stone-50 dark:bg-stone-950 lg:pt-20 pb-12">
      <Wrapper>
        <div>
          <div className="pt-8 pb-6 flex items-center justify-between">
            <h1 className="font-fraunces text-xl md:text-2xl text-stone-900 dark:text-stone-50">
              My Reports
            </h1>
            <button
              onClick={() =>
                window.dispatchEvent(new Event("open-report-modal"))
              }
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-stone-900 dark:bg-lime-300 text-stone-50 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-lime-200 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Report a problem
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <LoadingSpinner size="md" text="Loading reports..." />
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-10 text-center">
              <MessageSquare className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
              <p className="text-stone-600 dark:text-stone-400 mb-1">
                You haven't submitted any reports yet.
              </p>
              <p className="text-sm text-stone-400 dark:text-stone-500">
                Use the "Help" button at the bottom-right to report a problem.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 md:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                          {TYPE_LABELS[t.type] || t.type}
                        </span>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[t.status]}`}
                        >
                          {STATUS_LABELS[t.status]}
                        </span>
                      </div>
                      <h3 className="mt-2 font-semibold text-stone-800 dark:text-stone-100">
                        {t.title}
                      </h3>
                      <p className="mt-1 text-sm text-stone-600 dark:text-stone-400 whitespace-pre-wrap">
                        {t.message}
                      </p>
                    </div>
                    <span className="text-xs text-stone-400 dark:text-stone-500 shrink-0">
                      {formatDate(t.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Wrapper>
    </div>
  );
};

export default MyReports;