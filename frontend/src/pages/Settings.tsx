import { useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Trash2,
  Save,
  Moon,
  Sun,
  CreditCard,
  Palette,
  ShieldAlert,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { setTheme } from "../store/slices/themeSlice";
import { logoutUser, setUser } from "../store/slices/authSlice";
import { userApi } from "../api/api";
import ConfirmModal from "../components/ui/ConfirmModal";
import Wrapper from "../components/Wrapper";

export default function Settings() {
  const { user } = useAppSelector((state) => ({
    user: state.auth.user,
    loading: state.auth.loading,
  }));

  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.theme);
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const hasChanges = name.trim() !== "" && name !== user?.name;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userApi.updateProfile({ name });
      const updatedUser = res.data.data ?? res.data;
      dispatch(setUser(updatedUser));
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteConfirm(false);
    try {
      await userApi.deleteAccount();
      toast.success("Account deleted");
      await dispatch(logoutUser());
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };

  return (
    <div className="font-plex min-h-screen bg-stone-50 dark:bg-stone-950 pt-8 lg:pt-32 pb-10 md:pb-12">
      <Wrapper maxWidth="md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl">
        <div className="pt-8 lg:pt-0 pb-6">
          <h1 className="font-plex text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-50">
            Settings
          </h1>
          <p className="font-plex mt-1.5 text-sm text-stone-500 dark:text-stone-400">
            Manage your account preferences
          </p>
        </div>
        <div className="space-y-6">
          <ProfileSection
            user={user}
            name={name}
            setName={setName}
            saving={saving}
            hasChanges={hasChanges}
            onSave={handleSaveProfile}
          />
          <SubscriptionSection user={user} />
          <ThemeSection
            theme={theme}
            onToggle={() =>
              dispatch(setTheme(theme === "dark" ? "light" : "dark"))
            }
          />
          <DangerZone onDelete={() => setShowDeleteConfirm(true)} />
        </div>
      </Wrapper>
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
        type="danger"
      />
      <style>{`.font-plex { font-family: 'IBM Plex Sans', sans-serif; }`}</style>
    </div>
  );
}

const CardHeader = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) => (
  <div className="flex items-center gap-3 p-5 md:px-6 border-b border-stone-100 dark:border-stone-800">
    <span className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-lime-300 text-lime-300 dark:text-stone-900 flex items-center justify-center shrink-0">
      {icon}
    </span>
    <div className="min-w-0">
      <h2 className="font-plex text-base font-semibold text-stone-900 dark:text-stone-50">
        {title}
      </h2>
      {subtitle && (
        <p className="font-plex text-xs text-stone-500 dark:text-stone-400 mt-0.5">
          {subtitle}
        </p>
      )}
    </div>
  </div>
);

const ProfileSection = ({
  user,
  name,
  setName,
  saving,
  hasChanges,
  onSave,
}: {
  user: any;
  name: string;
  setName: (v: string) => void;
  saving: boolean;
  hasChanges: boolean;
  onSave: (e: React.FormEvent) => void;
}) => (
  <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden">
    <CardHeader
      icon={<User className="w-4 h-4" />}
      title="Profile Information"
      subtitle="Update your display name"
    />
    <form className="p-5 md:p-6 space-y-6" onSubmit={onSave}>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center overflow-hidden shrink-0">
          <img
            src="/profile_avatar.jpg"
            alt={user?.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="font-plex font-semibold text-stone-900 dark:text-stone-50 truncate">
            {user?.name || "Account"}
          </p>
          <p className="font-plex text-sm text-stone-500 dark:text-stone-400 truncate mt-0.5">
            {user?.email}
          </p>
        </div>
      </div>
      <div>
        <label className="font-plex block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
          Display Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="font-plex w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2.5 text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-lime-300 focus:border-transparent transition-all"
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving || !hasChanges}
          className="font-plex inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-stone-900 dark:bg-lime-300 text-white dark:text-stone-900 text-sm font-semibold hover:bg-stone-800 dark:hover:bg-lime-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  </div>
);

const SubscriptionSection = ({ user }: { user: any }) => (
  <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden">
    <CardHeader
      icon={<CreditCard className="w-4 h-4" />}
      title="Subscription"
      subtitle="Your current plan and usage"
    />
    <div className="p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-plex text-sm text-stone-500 dark:text-stone-400">
            Current plan:
          </span>
          <span className="font-plex inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-lime-50 text-lime-800 border border-lime-300 dark:bg-lime-400/10 dark:text-lime-200 dark:border-lime-400/20 capitalize">
            {user?.subscription.plan}
          </span>
        </div>
        <p className="font-plex text-sm text-stone-500 dark:text-stone-400">
          Credits remaining:{" "}
          <span className="font-medium text-stone-800 dark:text-stone-100">
            {user?.subscription.credits ?? 0}
          </span>
        </p>
      </div>
      {user?.subscription.plan === "free" && (
        <Link
          to="/plans"
          className="font-plex inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-stone-900 dark:bg-lime-300 text-white dark:text-stone-900 text-sm font-semibold hover:bg-stone-800 dark:hover:bg-lime-200 transition-colors"
        >
          Upgrade to Pro
        </Link>
      )}
    </div>
  </div>
);

const ThemeSection = ({
  theme,
  onToggle,
}: {
  theme: string;
  onToggle: () => void;
}) => (
  <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden">
    <CardHeader
      icon={<Palette className="w-4 h-4" />}
      title="Appearance"
      subtitle="Choose how CVCoach looks to you"
    />
    <div className="p-5 md:p-6">
      <div className="flex rounded-xl bg-stone-100 dark:bg-stone-800 p-1 w-fit">
        <button
          type="button"
          onClick={onToggle}
          className={`font-plex inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            theme === "light"
              ? "bg-white dark:bg-stone-900 shadow text-stone-900 dark:text-stone-50"
              : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
          }`}
        >
          <Sun className="w-4 h-4" /> Light
        </button>
        <button
          type="button"
          onClick={onToggle}
          className={`font-plex inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            theme === "dark"
              ? "bg-white dark:bg-stone-900 shadow text-stone-900 dark:text-stone-50"
              : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
          }`}
        >
          <Moon className="w-4 h-4" /> Dark
        </button>
      </div>
    </div>
  </div>
);

const DangerZone = ({ onDelete }: { onDelete: () => void }) => (
  <div className="bg-white dark:bg-stone-900 rounded-2xl border border-red-200 dark:border-red-900/40 shadow-xl overflow-hidden">
    <CardHeader
      icon={<ShieldAlert className="w-4 h-4" />}
      title="Danger Zone"
      subtitle="Once you delete your account, there is no going back"
    />
    <div className="p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <p className="font-plex text-sm text-stone-500 dark:text-stone-400">
        Permanently delete your account and all associated data.
      </p>
      <button
        onClick={onDelete}
        className="font-plex inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white dark:bg-stone-900 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 text-sm font-semibold transition-colors cursor-pointer shrink-0"
      >
        <Trash2 className="w-4 h-4" />
        Delete Account
      </button>
    </div>
  </div>
);