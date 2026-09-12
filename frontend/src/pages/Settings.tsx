import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Trash2, Save, Moon, Sun } from "lucide-react";
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
    <div className="min-h-screen lg:pt-20 pb-12">
      <Wrapper maxWidth="md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl">
        <div className="my-8">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100">Settings</h1>
          <p className="text-gray-600 mt-1 dark:text-gray-400">Manage your account preferences</p>
        </div>
        <div className="space-y-6">
          <ProfileSection user={user} name={name} setName={setName} />
          <SubscriptionSection user={user} />
          <ThemeSection theme={theme} onToggle={() => dispatch(setTheme(theme === "dark" ? "light" : "dark"))} />
          <DangerZone onDelete={() => setShowDeleteConfirm(true)} />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving || !hasChanges}
              className="flex items-center gap-2 text-sm bg-cyan-600 text-white px-4 py-2 hover:bg-cyan-600/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
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
    </div>
  );
}

const ProfileSection = ({
  user,
  name,
  setName,
}: {
  user: any;
  name: string;
  setName: (v: string) => void;
}) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-[0_0_6px_rgba(0,0,0,0.2)] dark:bg-secondary dark:border-accent">
    <div className="flex items-center gap-3 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Profile Information</h2>
    </div>
    <div className="flex items-center gap-4 mb-6">
      <img
        src="/profile_avatar.jpg"
        alt={user?.name}
        className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700"
      />
      <div>
        <p className="font-medium text-gray-800 dark:text-gray-100">{user?.name}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
      </div>
    </div>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5 dark:text-gray-300">
          Display Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-gray-400 transition-all duration-200 dark:bg-primary dark:border-accent dark:text-gray-100"
        />
      </div>
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
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-[0_0_6px_rgba(0,0,0,0.2)] dark:bg-secondary dark:border-accent">
    <div className="flex items-center justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Appearance
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Choose how CVScan looks to you.
        </p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 text-sm bg-cyan-600 text-white px-4 py-2 hover:bg-cyan-600/90 transition-colors"
      >
        {theme === "dark" ? (
          <>
            <Sun className="w-4 h-4" /> Light Mode
          </>
        ) : (
          <>
            <Moon className="w-4 h-4" /> Dark Mode
          </>
        )}
      </button>
    </div>
  </div>
);

const SubscriptionSection = ({ user }: { user: any }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-[0_0_6px_rgba(0,0,0,0.2)] dark:bg-secondary dark:border-accent">
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Subscription</h2>
        <p className="text-sm text-gray-600 mt-1 dark:text-gray-400">
          Current plan:{" "}
          <span className="font-medium capitalize dark:text-gray-200">
            {user?.subscription.plan}
          </span>
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Credits remaining:{" "}
          {/* <span className="font-medium">{user?.subscription.credits}</span> */}
          <span className="font-medium">0</span>
        </p>
      </div>
      {user?.subscription.plan === "free" && (
        <Link to="/plans" className="text-sm bg-cyan-600 text-white px-4 py-2 hover:bg-cyan-600/90 cursor-pointer">
          Upgrade to Pro
        </Link>
      )}
    </div>
  </div>
);

const DangerZone = ({ onDelete }: { onDelete: () => void }) => (
  <div className="bg-white rounded-xl border border-red-300 p-6 shadow-[0_0_6px_rgba(0,0,0,0.2)] dark:bg-secondary dark:border-red-500/80">
    <div className="flex items-center gap-3 mb-1">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Danger Zone</h2>
    </div>
    <p className="text-sm text-gray-600 mb-6 dark:text-gray-400">
      Once you delete your account, there is no going back. Please be certain.
    </p>
    <button
      onClick={onDelete}
      className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium"
    >
      Delete Account
    </button>
  </div>
);
