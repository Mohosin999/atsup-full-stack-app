import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Inbox } from 'lucide-react';
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
  open: 'bg-amber-50 dark:bg-amber-400/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-400/20',
  'in-progress': 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-600',
  resolved: 'bg-emerald-50 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-400/20',
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

      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl p-4 md:p-6">
        <div className="flex items-center justify-end mb-4">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={`font-plex px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  filter === f.value
                    ? 'bg-stone-900 dark:bg-lime-300 border-stone-900 dark:border-lime-300 text-white dark:text-stone-900'
                    : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-500'
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
          <div className="py-12 text-center text-stone-500 dark:text-stone-400">
          <Inbox className="w-10 h-10 mx-auto mb-2 text-stone-300 dark:text-stone-600" />
          No tickets found
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => {
            const expanded = expandedId === t.id;
            return (
              <div key={t.id} className="border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : t.id)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-lime-300 text-lime-300 dark:text-stone-900 flex items-center justify-center text-sm font-bold shrink-0">
                    {t.user?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-stone-800 dark:text-stone-100 truncate flex-1">{t.title}</p>
                      <div className="shrink-0 sm:hidden">
                        {expanded ? (
                          <ChevronUp className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                        )}
                      </div>
                    </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5">
                      {t.user?.name || 'Unknown'} · {t.user?.email || ''} · {formatDate(t.createdAt)}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2 sm:hidden">
                      <span className="font-plex text-xs font-medium px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                        {TYPE_LABELS[t.type] || t.type}
                      </span>
                      <span className={`font-plex text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[t.status]}`}>
                        {STATUS_LABELS[t.status]}
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <span className="font-plex text-xs font-medium px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      {TYPE_LABELS[t.type] || t.type}
                    </span>
                    <span className={`font-plex text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[t.status]}`}>
                      {STATUS_LABELS[t.status]}
                    </span>
                    {expanded ? (
                      <ChevronUp className="w-4 h-4 text-stone-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-400" />
                    )}
                  </div>
                </button>

                {expanded && (
                  <div className="px-4 pb-4 border-t border-stone-100 dark:border-stone-800 pt-3">
                      <p className="text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap">{t.message}</p>

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
                            className="font-plex px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-50 transition-colors"
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
                            className="font-plex px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
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
                            className="font-plex px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
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
                          className="font-plex inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 border border-transparent hover:border-red-300 dark:hover:border-red-500/30 transition-colors"
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