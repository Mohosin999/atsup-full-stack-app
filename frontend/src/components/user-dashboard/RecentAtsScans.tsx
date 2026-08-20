import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileCheck, ArrowUpRight, Eye, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { atsScoreApi } from "../../api/api";
import ConfirmModal from "../ui/ConfirmModal";

interface AtsScanItem {
  _id: string;
  id: string;
  title: string;
  resumeName: string;
  overallScore: number;
  createdAt: string;
}

export default function RecentAtsScans({
  scans,
  loading,
  onDelete,
}: {
  scans: AtsScanItem[];
  loading: boolean;
  onDelete?: (id: string) => void;
}) {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await atsScoreApi.delete(deleteId);
      toast.success("Deleted successfully");
      onDelete?.(deleteId);
    } catch {
      toast.error("Failed to delete");
    }
    setDeleteId(null);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl box-shadow border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Recent ATS Scans</h2>
          {!loading && scans.length > 0 && (
            <Link
              to="/scan-history"
              className="text-sm font-medium text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
            >
              See More <ArrowUpRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : scans.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">No scans yet</p>
        ) : (
          <div>
            {scans.map((scan) => (
              <div
                key={scan.id || scan._id}
                className="flex items-center justify-between p-3 rounded-lg border-b border-gray-200 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center">
                    <FileCheck className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 truncate max-w-[200px]">
                      {scan.resumeName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(scan.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/ats-scan/${scan.id || scan._id}`)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(scan.id || scan._id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Entry"
        message="Are you sure you want to delete this scan history entry?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmClassName="bg-red-500 hover:bg-red-600"
      />
    </>
  );
}
