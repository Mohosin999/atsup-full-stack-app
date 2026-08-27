import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Trash2, Save } from "lucide-react";
import { toast } from "react-toastify";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
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
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account preferences</p>
        </div>
        <div className="space-y-6">
          <ProfileSection user={user} name={name} setName={setName} />
          <SubscriptionSection user={user} />
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
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <div className="flex items-center gap-3 mb-6">
      <h2 className="text-lg font-semibold text-gray-800">Profile Information</h2>
    </div>
    <div className="flex items-center gap-4 mb-6">
      <img
        src="/profile_avatar.jpg"
        alt={user?.name}
        className="w-16 h-16 rounded-full bg-gray-100"
      />
      <div>
        <p className="font-medium text-gray-800">{user?.name}</p>
        <p className="text-sm text-gray-600">{user?.email}</p>
      </div>
    </div>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Display Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:border-transparent transition-all duration-200"
        />
      </div>
    </div>
  </div>
);

const SubscriptionSection = ({ user }: { user: any }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Subscription</h2>
        <p className="text-sm text-gray-600 mt-1">
          Current plan:{" "}
          <span className="font-medium capitalize">
            {user?.subscription.plan}
          </span>
        </p>
        <p className="text-sm text-gray-600">
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
  <div className="bg-white rounded-xl border border-red-300 p-6">
    <div className="flex items-center gap-3 mb-1">
      <h2 className="text-lg font-semibold text-gray-800">Danger Zone</h2>
    </div>
    <p className="text-sm text-gray-600 mb-6">
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
