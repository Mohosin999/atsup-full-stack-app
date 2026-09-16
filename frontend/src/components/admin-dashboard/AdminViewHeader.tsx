import React from "react";
import { RefreshCw } from "lucide-react";

interface AdminViewHeaderProps {
  title: string;
  count?: number;
  countLabel?: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  rightActions?: React.ReactNode;
  leftActions?: React.ReactNode;
}

const AdminViewHeader: React.FC<AdminViewHeaderProps> = ({
  title,
  count,
  countLabel = "total",
  isRefreshing = false,
  onRefresh,
  rightActions,
  leftActions,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="font-plex text-xl font-semibold text-stone-800 dark:text-stone-100">
          {title}
          {count !== undefined && (
            <span className="font-plex text-sm font-normal text-stone-500 dark:text-stone-400 ml-1.5">
              ({count} {countLabel})
            </span>
          )}
        </h2>
        {leftActions}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="font-plex inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 hover:border-stone-500 dark:hover:border-lime-300 hover:text-stone-900 dark:hover:text-lime-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        )}
        {rightActions}
      </div>
    </div>
  );
};

export default AdminViewHeader;
