import React, { useState } from 'react';
import {
  Ban,
  Pencil,
  ShieldCheck,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { AdminUser, OnlineUser } from '../../types';
import LoadingSpinner from '../ui/LoadingSpinner';
import EditUserModal from './EditUserModal';
import ConfirmModal from '../ui/ConfirmModal';
import AdminViewHeader from './AdminViewHeader';

interface Props {
  onlineUsers: OnlineUser[];
  currentAdminId: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

type ConfirmAction = { type: 'ban' | 'unban' | 'delete'; user: AdminUser } | null;

type Tab = 'all' | 'inactive7' | 'inactive30';

const lastActivity = (u: AdminUser) => u.lastActiveAt ?? u.lastLoginAt ?? u.createdAt;

const isInactiveFor = (u: AdminUser, days: number) => {
  if (u.role === 'admin') return false;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return (
    new Date(lastActivity(u)).getTime() < cutoff &&
    new Date(u.createdAt).getTime() < cutoff
  );
};

const UserManagement: React.FC<Props> = ({ onlineUsers, currentAdminId, onRefresh, isRefreshing }) => {
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [confirmBulk, setConfirmBulk] = useState<null | 7 | 30>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('all');

  const { data: users = [], isLoading: loading } = useQuery<AdminUser[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await api.get('/admin-dashboard/users');
      return res.data.success ? res.data.data : [];
    },
  });

  const banMutation = useMutation({
    mutationFn: ({ userId, isBanned }: { userId: string; isBanned: boolean }) =>
      api.patch(`/admin-dashboard/users/${userId}/ban`, { isBanned }),
    onSuccess: (_, variables) => {
      queryClient.setQueryData(["admin-users"], (old: AdminUser[] | undefined) =>
        (old || []).map((u) =>
          u.id === variables.userId ? { ...u, isBanned: variables.isBanned } : u
        )
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => api.delete(`/admin-dashboard/users/${userId}`),
    onSuccess: (_, userId) => {
      queryClient.setQueryData(["admin-users"], (old: AdminUser[] | undefined) =>
        (old || []).filter((u) => u.id !== userId)
      );
      queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (days: 7 | 30) => api.delete(`/admin-dashboard/users/inactive?days=${days}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
      setConfirmBulk(null);
    },
    onError: () => {
      alert('Failed to delete inactive users');
      setConfirmBulk(null);
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      api.patch(`/admin-dashboard/users/${userId}`, data),
    onSuccess: (_, variables) => {
      queryClient.setQueryData(["admin-users"], (old: AdminUser[] | undefined) =>
        (old || []).map((u) =>
          u.id === variables.userId ? { ...u, ...variables.data } : u
        )
      );
      setEditingUser(null);
    },
  });

  const onlineIds = new Set(onlineUsers.map((u) => u.id));

  const inactive7 = users.filter((u) => isInactiveFor(u, 7));
  const inactive30 = users.filter((u) => isInactiveFor(u, 30));

  const visibleUsers =
    tab === 'inactive7' ? inactive7 : tab === 'inactive30' ? inactive30 : users;

  const sortedUsers = [...visibleUsers].sort((a, b) => {
    const aOnline = onlineIds.has(a.id) ? 1 : 0;
    const bOnline = onlineIds.has(b.id) ? 1 : 0;
    if (aOnline !== bOnline) return bOnline - aOnline;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const toggleBan = (user: AdminUser) => {
    setBusyId(user.id);
    banMutation.mutate(
      { userId: user.id, isBanned: !user.isBanned },
      {
        onSuccess: () => setBusyId(null),
        onError: () => {
          alert('Failed to update user');
          setBusyId(null);
        },
      }
    );
  };

  const deleteUser = (user: AdminUser) => {
    setBusyId(user.id);
    deleteMutation.mutate(user.id, {
      onSuccess: () => setBusyId(null),
      onError: () => {
        alert('Failed to delete user');
        setBusyId(null);
      },
    });
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    const { type, user } = confirmAction;
    if (type === 'delete') {
      deleteUser(user);
    } else {
      toggleBan(user);
    }
    setConfirmAction(null);
  };

  const handleSave = (data: { name: string; role: string; credits: number }) => {
    if (!editingUser) return;
    setBusyId(editingUser.id);
    editMutation.mutate(
      { userId: editingUser.id, data },
      {
        onError: () => {
          alert('Failed to save user');
          setBusyId(null);
        },
      }
    );
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return '—';
    }
  };

  const isSelf = (u: AdminUser) => u.id === currentAdminId;
  const isOtherAdmin = (u: AdminUser) => u.role === 'admin' && !isSelf(u);

  const renderRole = (u: AdminUser) =>
    u.role === 'admin' ? (
      <span className="font-plex inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-900 dark:bg-lime-300 text-lime-300 dark:text-stone-900 text-xs font-semibold">
        <ShieldCheck className="w-3 h-3" /> Admin
      </span>
    ) : (
      <span className="font-plex px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-medium">
        User
      </span>
    );

  const renderStatus = (u: AdminUser, online: boolean) =>
    u.isBanned ? (
      <span className="font-plex inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-400/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 text-xs font-semibold">
        <Ban className="w-3 h-3" /> Banned
      </span>
    ) : online ? (
      <span className="font-plex inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-lime-50 dark:bg-lime-400/10 text-lime-700 dark:text-lime-300 border border-lime-300 dark:border-lime-400/20 text-xs font-semibold">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full bg-lime-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 bg-lime-500 rounded-full" />
        </span>
        Online
      </span>
    ) : (
      <span className="font-plex px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-medium">
        Active
      </span>
    );

  const renderActions = (u: AdminUser) => (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => setEditingUser(u)}
        disabled={isOtherAdmin(u) || busyId === u.id}
        title={isOtherAdmin(u) ? "Can't edit another admin" : 'Edit'}
        className="p-2 rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-900 hover:bg-stone-100 dark:hover:text-lime-300 dark:hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => setConfirmAction({ type: u.isBanned ? 'unban' : 'ban', user: u })}
        disabled={isSelf(u) || isOtherAdmin(u) || busyId === u.id}
        title={
          isSelf(u)
            ? "Can't ban yourself"
            : isOtherAdmin(u)
              ? "Can't ban another admin"
              : u.isBanned
                ? 'Unban'
                : 'Ban'
        }
        className="p-2 rounded-lg text-stone-500 dark:text-stone-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-400/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {u.isBanned ? <RotateCcw className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
      </button>
      <button
        type="button"
        onClick={() => setConfirmAction({ type: 'delete', user: u })}
        disabled={isSelf(u) || isOtherAdmin(u) || busyId === u.id}
        title={
          isSelf(u) ? "Can't delete yourself" : isOtherAdmin(u) ? "Can't delete another admin" : 'Delete'
        }
        className="p-2 rounded-lg text-stone-500 dark:text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-400/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <>
      <AdminViewHeader
        title={tab === 'all' ? 'All Users' : tab === 'inactive7' ? 'Inactive (7 days)' : 'Inactive (30 days)'}
        count={sortedUsers.length}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(
          [
            { key: 'all', label: `All Users (${users.length})` },
            { key: 'inactive7', label: `7 days inactive (${inactive7.length})` },
            { key: 'inactive30', label: `30 days inactive (${inactive30.length})` },
          ] as { key: Tab; label: string }[]
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`font-plex px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              tab === t.key
                ? 'bg-stone-900 dark:bg-lime-300 border-stone-900 dark:border-lime-300 text-white dark:text-stone-900'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-500'
            }`}
          >
            {t.label}
          </button>
        ))}
        {tab !== 'all' && sortedUsers.length > 0 && (
          <button
            type="button"
            onClick={() => setConfirmBulk(tab === 'inactive7' ? 7 : 30)}
            disabled={bulkDeleteMutation.isPending}
            className="font-plex ml-auto px-3.5 py-1.5 rounded-full text-xs font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {bulkDeleteMutation.isPending ? 'Deleting...' : `Delete all (${sortedUsers.length})`}
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="md" text="Loading users..." />
        </div>
      ) : sortedUsers.length === 0 ? (
        <div className="py-12 text-center text-stone-500 dark:text-stone-400">No users found</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
                  <th className="py-3.5 px-5 font-medium text-xs uppercase tracking-wide">User</th>
                  <th className="py-3.5 px-5 font-medium text-xs uppercase tracking-wide">Role</th>
                  <th className="py-3.5 px-5 font-medium text-xs uppercase tracking-wide">Status</th>
                  <th className="py-3.5 px-5 font-medium text-xs uppercase tracking-wide">Credits</th>
                  <th className="py-3.5 px-5 font-medium text-xs uppercase tracking-wide">Last active</th>
                  <th className="py-3.5 px-5 font-medium text-xs uppercase tracking-wide">Joined</th>
                  <th className="py-3.5 px-5 font-medium text-xs uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((u) => (
                  <tr key={u.id} className="border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-stone-900 dark:bg-lime-300 text-lime-300 dark:text-stone-900 flex items-center justify-center text-xs font-bold shrink-0">
                          {u.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-stone-800 dark:text-stone-100 truncate">
                            {u.name}
                            {isSelf(u) && <span className="ml-1 text-xs text-stone-400 dark:text-stone-500">(you)</span>}
                          </p>
                          <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">{renderRole(u)}</td>
                    <td className="py-3.5 px-5">{renderStatus(u, onlineIds.has(u.id))}</td>
                    <td className="py-3.5 px-5 text-stone-700 dark:text-stone-300">{u.subscription?.credits ?? 0}</td>
                    <td className="py-3.5 px-5 text-stone-500 dark:text-stone-400">{formatDate(lastActivity(u))}</td>
                    <td className="py-3.5 px-5 text-stone-500 dark:text-stone-400">{formatDate(u.createdAt)}</td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-end">{renderActions(u)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3 p-4">
            {sortedUsers.map((u) => {
              const online = onlineIds.has(u.id);
              return (
                <div key={u.id} className="border border-stone-200 dark:border-stone-800 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-lime-300 text-lime-300 dark:text-stone-900 flex items-center justify-center text-sm font-bold shrink-0">
                      {u.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-stone-800 dark:text-stone-100 truncate">
                        {u.name}
                        {isSelf(u) && <span className="ml-1 text-xs text-stone-400">(you)</span>}
                      </p>
                      <p className="text-xs text-stone-500 truncate">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {renderRole(u)}
                    {renderStatus(u, online)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex items-center justify-between bg-stone-50 dark:bg-stone-800/60 rounded-lg px-3 py-2">
                      <span className="text-xs text-stone-500 dark:text-stone-400">Credits</span>
                      <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                        {u.subscription?.credits ?? 0}
                      </span>
                    </div>
                      <div className="flex items-center justify-between bg-stone-50 dark:bg-stone-800/60 rounded-lg px-3 py-2">
                      <span className="text-xs text-stone-500 dark:text-stone-400">Last active</span>
                      <span className="text-sm font-medium text-stone-800 dark:text-stone-100">
                        {formatDate(lastActivity(u))}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end border-t border-stone-100 dark:border-stone-800 pt-3">
                    {renderActions(u)}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          isSelf={isSelf(editingUser)}
          busy={busyId === editingUser.id}
          onClose={() => setEditingUser(null)}
          onSave={handleSave}
        />
      )}

      <ConfirmModal
        isOpen={confirmBulk !== null}
        title={`Delete ${confirmBulk}-day inactive users`}
        message={`Are you sure you want to permanently delete ${sortedUsers.length} users inactive for ${confirmBulk} days? Their resumes and all data will be removed. Admins are never deleted.`}
        confirmText={bulkDeleteMutation.isPending ? 'Deleting...' : 'Delete all'}
        type="danger"
        onConfirm={() => confirmBulk !== null && bulkDeleteMutation.mutate(confirmBulk)}
        onCancel={() => setConfirmBulk(null)}
      />

      <ConfirmModal
        isOpen={!!confirmAction}
        title={confirmAction?.type === 'delete' ? 'Delete User' : confirmAction?.type === 'unban' ? 'Unban User' : 'Ban User'}
        message={
          confirmAction?.type === 'delete'
            ? `Are you sure you want to permanently delete "${confirmAction.user?.name}"? This will remove their account, resumes and all data.`
            : confirmAction?.type === 'unban'
              ? `Are you sure you want to unban "${confirmAction.user?.name}"? They will be able to log in again.`
              : `Are you sure you want to ban "${confirmAction?.user?.name}"? They will be blocked from logging in.`
        }
        confirmText={confirmAction?.type === 'delete' ? 'Delete' : confirmAction?.type === 'unban' ? 'Unban' : 'Ban'}
        type={confirmAction?.type === 'unban' ? 'info' : 'danger'}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
      </div>
    </>
  );
};

export default UserManagement;