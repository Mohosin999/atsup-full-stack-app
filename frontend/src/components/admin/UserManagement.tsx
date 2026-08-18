import React, { useEffect, useState } from 'react';
import {
  Ban,
  Pencil,
  ShieldCheck,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import api from '../../api/api';
import { AdminUser, OnlineUser } from '../../types';
import EditUserModal from './EditUserModal';
import ConfirmModal from '../ui/ConfirmModal';

interface Props {
  onlineUsers: OnlineUser[];
  currentAdminId: string;
}

type ConfirmAction = { type: 'ban' | 'unban' | 'delete'; user: AdminUser } | null;

const UserManagement: React.FC<Props> = ({ onlineUsers, currentAdminId }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin-dashboard/users');
      if (res.data.success) setUsers(res.data.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onlineIds = new Set(onlineUsers.map((u) => u.id));

  const sortedUsers = [...users].sort((a, b) => {
    const aOnline = onlineIds.has(a.id) ? 1 : 0;
    const bOnline = onlineIds.has(b.id) ? 1 : 0;
    if (aOnline !== bOnline) return bOnline - aOnline;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const toggleBan = async (user: AdminUser) => {
    setBusyId(user.id);
    try {
      const res = await api.patch(`/admin-dashboard/users/${user.id}/ban`, {
        isBanned: !user.isBanned,
      });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isBanned: res.data.data.isBanned } : u)),
        );
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update user');
    } finally {
      setBusyId(null);
    }
  };

  const deleteUser = async (user: AdminUser) => {
    setBusyId(user.id);
    try {
      const res = await api.delete(`/admin-dashboard/users/${user.id}`);
      if (res.data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete user');
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    const { type, user } = confirmAction;
    if (type === 'delete') {
      await deleteUser(user);
    } else {
      await toggleBan(user);
    }
    setConfirmAction(null);
  };

  const handleSave = async (data: { name: string; role: string; credits: number }) => {
    if (!editingUser) return;
    setBusyId(editingUser.id);
    try {
      const res = await api.patch(`/admin-dashboard/users/${editingUser.id}`, data);
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? { ...u, ...res.data.data } : u)),
        );
        setEditingUser(null);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to save user');
    } finally {
      setBusyId(null);
    }
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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-800">All Users</h2>
        <span className="text-sm text-gray-500">{users.length} total</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="py-2 pr-4 font-medium">User</th>
                <th className="py-2 pr-4 font-medium">Role</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Credits</th>
                <th className="py-2 pr-4 font-medium">Joined</th>
                <th className="py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((u) => {
                const online = onlineIds.has(u.id);
                return (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-semibold shrink-0">
                          {u.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {u.name}
                            {isSelf(u) && <span className="ml-1 text-xs text-gray-400">(you)</span>}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                          User
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      {u.isBanned ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                          <Ban className="w-3 h-3" /> Banned
                        </span>
                      ) : online ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 text-xs font-medium">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                          </span>
                          Online
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-gray-700">{u.subscription?.credits ?? 0}</td>
                    <td className="py-3 pr-4 text-gray-500">{formatDate(u.createdAt)}</td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingUser(u)}
                          disabled={isOtherAdmin(u) || busyId === u.id}
                          title={isOtherAdmin(u) ? "Can't edit another admin" : 'Edit'}
                          className="p-1.5 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed"
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
                          className="p-1.5 rounded-md text-gray-500 hover:text-amber-600 hover:bg-amber-50 disabled:opacity-40 disabled:cursor-not-allowed"
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
                          className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {sortedUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
  );
};

export default UserManagement;