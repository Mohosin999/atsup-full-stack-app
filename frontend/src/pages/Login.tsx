import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks/redux";
import { login, fetchUser } from "../store/slices/authSlice";
import {
  getLoginRedirect,
  saveRedirectForOAuth,
  consumeRedirect,
} from "../utils/authGuard";
import api from "../api/api";

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const response = await api.post(endpoint, formData);

      if (response.data.success) {
        const result = await dispatch(fetchUser());
        const user = result.payload as { role?: string } | null;
        const redirect = getLoginRedirect() || consumeRedirect();
        if (redirect) {
          navigate(redirect, { replace: true });
        } else {
          navigate(user?.role === "admin" ? "/admin-dashboard" : "/dashboard", { replace: true });
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 pt-28 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Welcome to CV<span className="text-primary">Coach</span>
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-600">
            {isRegister
              ? "Create your account"
              : "Sign in to analyze and improve your resume"}
          </p>
        </div>

        <div className="card">
          <button
            onClick={() => {
              saveRedirectForOAuth();
              dispatch(login());
            }}
            className="w-full inline-flex items-center justify-center px-4 py-3 font-medium rounded-lg transition-all duration-200 text-lg border border-gray-300 hover:border-cyan-600"
          >
            <FcGoogle className="w-6 h-6 mr-2" />
            Continue with Google
          </button>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-200">
            <p className="text-sm text-gray-500 dark:text-gray-600 text-center mb-4">
              Or {isRegister ? "create an account" : "sign in"} with email
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-1">
                    Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-300 rounded-lg bg-white dark:bg-white text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-300 rounded-lg bg-white dark:bg-white text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-300 rounded-lg bg-white dark:bg-white text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-btn-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
                    Loading...
                  </span>
                ) : isRegister ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-600">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
                setFormData({ name: "", email: "", password: "" });
              }}
              className="text-primary hover:underline font-medium"
            >
              {isRegister ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-600">
            By signing in, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
