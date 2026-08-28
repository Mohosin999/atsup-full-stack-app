import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { AdminUser } from '../../types';

interface Props {
  user: AdminUser;
  isSelf: boolean;
  busy: boolean;
  onClose: () => void;
  onSave: (data: { name: string; role: string; credits: number }) => void;
}

const EditUserModal: React.FC<Props> = ({ user, isSelf, busy, onClose, onSave }) => {
  const [name, setName] = useState(user.name || '');
  const [role, setRole] = useState(user.role || 'user');
  const [credits, setCredits] = useState<number>(user.subscription?.credits ?? 0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name: name.trim() || user.name, role, credits });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 dark:border dark:border-gray-700 shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Edit User</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isSelf}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-400"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            {isSelf && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">You cannot change your own role.</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Credits</label>
            <input
              type="number"
              min={0}
              value={credits}
              onChange={(e) => setCredits(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {busy ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;