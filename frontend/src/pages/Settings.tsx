import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Trash2, Save } from "lucide-react";
import { toast } from "react-toastify";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { logoutUser, fetchUser } from "../store/slices/authSlice";
import { userApi } from "../api/api";
import BackButton from "../components/ui/BackButton";
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

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await userApi.updateProfile({ name });
      await dispatch(fetchUser());
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
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <Wrapper maxWidth="max-w-3xl">
        <div className="mt-6 mb-1">
          <BackButton />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account preferences</p>
        </motion.div>
        <div className="space-y-6">
          <ProfileSection user={user} name={name} setName={setName} />
          <SubscriptionSection user={user} />
          <DangerZone onDelete={() => setShowDeleteConfirm(true)} />
          <div className="flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="gradient-btn"
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
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="bg-white rounded-xl border border-gray-200 p-6"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
        <User className="w-5 h-5 text-primary" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
    </div>
    <div className="flex items-center gap-4 mb-6">
      {user?.picture ? (
        <img
          src={user.picture}
          alt={user.name}
          className="w-16 h-16 rounded-full"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
          {user?.name?.charAt(0) || "U"}
        </div>
      )}
      <div>
        <p className="font-medium text-gray-900">{user?.name}</p>
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-transparent transition-all duration-200"
        />
      </div>
    </div>
  </motion.div>
);

const SubscriptionSection = ({ user }: { user: any }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="bg-white rounded-xl border border-gray-200 p-6"
  >
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Subscription</h2>
        <p className="text-sm text-gray-600 mt-1">
          Current plan:{" "}
          <span className="font-medium capitalize">
            {user?.subscription.plan}
          </span>
        </p>
        <p className="text-sm text-gray-600">
          Credits remaining:{" "}
          <span className="font-medium">{user?.subscription.credits}</span>
        </p>
      </div>
      {user?.subscription.plan === "free" && (
        <Link to="/plans" className="gradient-btn">
          Upgrade to Pro
        </Link>
      )}
    </div>
  </motion.div>
);

const DangerZone = ({ onDelete }: { onDelete: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="bg-white rounded-xl border border-red-300 p-6"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
        <Trash2 className="w-5 h-5 text-red-500" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900">Danger Zone</h2>
    </div>
    <p className="text-sm text-gray-600 mb-4">
      Once you delete your account, there is no going back. Please be certain.
    </p>
    <button
      onClick={onDelete}
      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
    >
      Delete Account
    </button>
  </motion.div>
);
