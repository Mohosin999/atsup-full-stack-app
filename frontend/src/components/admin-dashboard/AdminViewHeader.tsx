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
        <h2 className="text-lg font-semibold text-gray-800">
          {title}
          {count !== undefined && (
            <span className="text-sm font-normal text-gray-500 ml-1.5">
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-cyan-600 border border-gray-300 hover:border-cyan-500 transition-colors disabled:opacity-50"
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
