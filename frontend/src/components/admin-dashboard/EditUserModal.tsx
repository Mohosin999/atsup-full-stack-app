import React, { useEffect, useState } from 'react';
import { X, PencilLine } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/50 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="relative bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl rounded-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="font-plex absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-stone-900 dark:bg-lime-300 text-lime-300 dark:text-stone-900 flex items-center justify-center mb-5">
          <PencilLine className="w-6 h-6" />
        </div>

        <h3 className="font-fraunces text-lg text-stone-900 dark:text-stone-50 mb-1">
          Edit User
        </h3>
        <p className="font-plex text-sm text-stone-500 dark:text-stone-400 mb-6">
          Update {user.email}
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="font-plex block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-plex w-full px-3.5 py-2.5 border border-stone-300 dark:border-stone-700 rounded-xl bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-lime-300 focus:border-transparent"
            />
          </div>

          <div>
            <label className="font-plex block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isSelf}
              className="font-plex w-full px-3.5 py-2.5 border border-stone-300 dark:border-stone-700 rounded-xl bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-lime-300 focus:border-transparent disabled:bg-stone-100 dark:disabled:bg-stone-800 disabled:text-stone-400 disabled:cursor-not-allowed"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            {isSelf && <p className="font-plex mt-1.5 text-xs text-stone-400 dark:text-stone-500">You cannot change your own role.</p>}
          </div>

          <div>
            <label className="font-plex block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Credits</label>
            <input
              type="number"
              min={0}
              value={credits}
              onChange={(e) => setCredits(Number(e.target.value))}
              className="font-plex w-full px-3.5 py-2.5 border border-stone-300 dark:border-stone-700 rounded-xl bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-lime-300 focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="font-plex px-4 py-2.5 rounded-xl text-sm font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="font-plex px-4 py-2.5 rounded-xl text-sm font-semibold bg-stone-900 text-white hover:bg-stone-800 dark:bg-lime-300 dark:text-stone-900 dark:hover:bg-lime-200 disabled:opacity-50 transition-colors"
            >
              {busy ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        .font-fraunces { font-family: 'Fraunces', serif; }
        .font-plex { font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>
    </div>
  );
};

export default EditUserModal;