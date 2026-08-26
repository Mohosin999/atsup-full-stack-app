import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Paperclip, Inbox } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { SupportStatus, SupportTicket } from '../../types';
import LoadingSpinner from '../ui/LoadingSpinner';
import ConfirmModal from '../ui/ConfirmModal';
import AdminViewHeader from './AdminViewHeader';

interface Props {
  refreshKey: number;
  onOpenCount: (count: number) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

type Filter = 'all' | SupportStatus;

const STATUS_STYLES: Record<SupportStatus, string> = {
  open: 'bg-amber-100 text-amber-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  resolved: 'bg-cyan-100 text-cyan-700',
};

const STATUS_LABELS: Record<SupportStatus, string> = {
  open: 'Open',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
};

const TYPE_LABELS: Record<string, string> = {
  bug: 'Bug',
  feature: 'Feature Request',
  other: 'Other',
};

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

const attachmentUrl = (path: string) => {
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  if (apiUrl.startsWith('http')) return new URL(apiUrl).origin + path;
  return path;
};

const SupportTickets: React.FC<Props> = ({ refreshKey, onOpenCount, onRefresh, isRefreshing }) => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<SupportTicket | null>(null);

  const { data: tickets = [], isLoading: loading } = useQuery<SupportTicket[]>({
    queryKey: ["admin-support", refreshKey],
    queryFn: async () => {
      const res = await api.get('/admin-dashboard/support');
      if (res.data.success) {
        onOpenCount(res.data.data.filter((t: SupportTicket) => t.status === 'open').length);
        return res.data.data;
      }
      return [];
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: SupportStatus }) =>
      api.patch(`/admin-dashboard/support/${id}`, { status }),
    onSuccess: (_, variables) => {
      queryClient.setQueryData(["admin-support", refreshKey], (old: SupportTicket[] | undefined) => {
        const next = (old || []).map((t) =>
          t.id === variables.id ? { ...t, status: variables.status } : t
        );
        onOpenCount(next.filter((t) => t.status === 'open').length);
        return next;
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin-dashboard/support/${id}`),
    onSuccess: (_, id) => {
      queryClient.setQueryData(["admin-support", refreshKey], (old: SupportTicket[] | undefined) => {
        const next = (old || []).filter((t) => t.id !== id);
        onOpenCount(next.filter((t) => t.status === 'open').length);
        return next;
      });
      setConfirmDelete(null);
    },
  });

  const filtered = filter === 'all' ? tickets : tickets.filter((t) => t.status === filter);
  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return '—';
    }
  };

  return (
    <>
      <AdminViewHeader
        title="Support Tickets"
        count={tickets.length}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="bg-white box-shadow p-4 md:p-6">
        <div className="flex items-center justify-end mb-4">
          <div className="flex flex-wrap gap-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === f.value ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="md" text="Loading tickets..." />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          <Inbox className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          No tickets found
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => {
            const expanded = expandedId === t.id;
            return (
              <div key={t.id} className="border border-gray-200">
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : t.id)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50"
                >
                  <div className="w-9 h-9 bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-semibold shrink-0">
                    {t.user?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800 truncate flex-1">{t.title}</p>
                      <div className="shrink-0 sm:hidden">
                        {expanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {t.user?.name || 'Unknown'} · {t.user?.email || ''} · {formatDate(t.createdAt)}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2 sm:hidden">
                      <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600">
                        {TYPE_LABELS[t.type] || t.type}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 ${STATUS_STYLES[t.status]}`}>
                        {STATUS_LABELS[t.status]}
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600">
                      {TYPE_LABELS[t.type] || t.type}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 ${STATUS_STYLES[t.status]}`}>
                      {STATUS_LABELS[t.status]}
                    </span>
                    {expanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {expanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{t.message}</p>

                    {t.attachment && (
                      <a
                        href={attachmentUrl(t.attachment)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-sm text-cyan-600 hover:underline"
                      >
                        <Paperclip className="w-4 h-4" />
                        View attachment
                      </a>
                    )}

                    <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {t.status !== 'in-progress' && (
                          <button
                            type="button"
                            disabled={busyId === t.id}
                            onClick={() => {
                              setBusyId(t.id);
                              statusMutation.mutate(
                                { id: t.id, status: 'in-progress' },
                                { onSettled: () => setBusyId(null) }
                              );
                            }}
                            className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            Mark in progress
                          </button>
                        )}
                        {t.status !== 'resolved' && (
                          <button
                            type="button"
                            disabled={busyId === t.id}
                            onClick={() => {
                              setBusyId(t.id);
                              statusMutation.mutate(
                                { id: t.id, status: 'resolved' },
                                { onSettled: () => setBusyId(null) }
                              );
                            }}
                            className="px-3 py-1.5 text-xs font-medium bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-50"
                          >
                            Resolve
                          </button>
                        )}
                        {t.status === 'resolved' && (
                          <button
                            type="button"
                            disabled={busyId === t.id}
                            onClick={() => {
                              setBusyId(t.id);
                              statusMutation.mutate(
                                { id: t.id, status: 'open' },
                                { onSettled: () => setBusyId(null) }
                              );
                            }}
                            className="px-3 py-1.5 text-xs font-medium bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
                          >
                            Reopen
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(t)}
                          disabled={busyId === t.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Delete Ticket"
        message={`Are you sure you want to delete "${confirmDelete?.title}" from "${confirmDelete?.user?.name}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
        onConfirm={() => confirmDelete && deleteMutation.mutate(confirmDelete.id)}
        onCancel={() => setConfirmDelete(null)}
      />
      </div>
    </>
  );
};

export default SupportTickets;