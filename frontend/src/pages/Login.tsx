// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Mail, Lock, User, Eye, EyeOff, LogIn, Loader2, ShieldCheck } from "lucide-react";
// import { FcGoogle } from "react-icons/fc";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { useAppDispatch } from "../hooks/redux";
// import { login, fetchUser } from "../store/slices/authSlice";
// import {
//   getLoginRedirect,
//   saveRedirectForOAuth,
//   consumeRedirect,
// } from "../utils/authGuard";
// import { getFingerprint } from "../utils/fingerprint";
// import api, { setTokens } from "../api/api";

// export default function Login() {
//   const dispatch = useAppDispatch();
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const [isRegister, setIsRegister] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const errCode = searchParams.get("error");
//     const reason = searchParams.get("reason");
//     if (errCode === "device_blocked") {
//       setError(
//         reason
//           ? decodeURIComponent(reason)
//           : "An account already exists on this device. Each device is limited to one account."
//       );
//       window.history.replaceState({}, "", "/login");
//     } else if (errCode === "not_gmail") {
//       setError(
//         reason
//           ? decodeURIComponent(reason)
//           : "Only Gmail addresses are accepted for registration."
//       );
//       window.history.replaceState({}, "", "/login");
//     } else if (errCode === "auth_failed") {
//       setError("Google sign-in failed. Please try again.");
//       window.history.replaceState({}, "", "/login");
//     }
//   }, [searchParams]);

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     setError("");
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const endpoint = isRegister ? "/auth/register" : "/auth/login";
//       const payload: any = { ...formData };

//       if (isRegister) {
//         try {
//           payload.fingerprint = await getFingerprint();
//         } catch {
//           // fingerprint failure should not block registration
//         }
//       }

//       const response = await api.post(endpoint, payload);

//       if (response.data.success) {
//         const { accessToken, refreshToken } = response.data.data || {};
//         if (accessToken && refreshToken) setTokens(accessToken, refreshToken);
//         const result = await dispatch(fetchUser());
//         const user = result.payload as { role?: string } | null;
//         console.log("Login debug - user:", user);
//         const redirect = getLoginRedirect() || consumeRedirect();
//         if (redirect) {
//           navigate(redirect, { replace: true });
//         } else {
//           navigate(user?.role === "admin" ? "/admin-dashboard" : "/", {
//             replace: true,
//           });
//         }
//       }
//     } catch (err: any) {
//       setError(err.response?.data?.message || "An error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleLogin = async () => {
//     saveRedirectForOAuth();
//     try {
//       const fingerprint = await getFingerprint();
//       window.location.href = `${api.defaults.baseURL}/auth/google?fingerprint=${encodeURIComponent(fingerprint)}`;
//     } catch {
//       dispatch(login());
//     }
//   };

//   const toggleMode = () => {
//     setIsRegister(!isRegister);
//     setError("");
//     setFormData({ name: "", email: "", password: "" });
//   };

//   return (
//     <div className="font-plex min-h-screen bg-stone-50 dark:bg-stone-950 pt-14 lg:pt-24 pb-12 flex items-center justify-center px-4">
//       {/* dot-grid texture */}
//       <div
//         className="pointer-events-none fixed inset-0 opacity-40 dark:opacity-10"
//         style={{
//           backgroundImage:
//             "radial-gradient(circle, rgba(28,25,23,0.35) 1px, transparent 1px)",
//           backgroundSize: "28px 28px",
//         }}
//       />

//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="relative z-10 w-full max-w-sm xl:max-w-md"
//       >
//         {/* Card */}
//         <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 md:p-8 xl:p-10 shadow-[0_0_6px_rgba(0,0,0,0.06)] dark:shadow-none">
//           {/* Heading */}
//           <div className="text-center mb-6">
//             <h1 className="font-fraunces text-xl xl:text-2xl font-normal text-stone-900 dark:text-stone-50">
//               {isRegister ? (
//                 <>
//                   Create your{" "}
//                   <span className="relative inline-block whitespace-nowrap">
//                     <span className="relative z-10">account</span>
//                     <span className="absolute left-0 right-0 bottom-[0.06em] h-[0.28em] bg-lime-300/80 dark:bg-lime-400/70 rounded-[2px] -z-0" />
//                   </span>
//                 </>
//               ) : (
//                 <>
//                   Welcome{" "}
//                   <span className="relative inline-block whitespace-nowrap">
//                     <span className="relative z-10">back</span>
//                     <span className="absolute left-0 right-0 bottom-[0.06em] h-[0.28em] bg-lime-300/80 dark:bg-lime-400/70 rounded-[2px] -z-0" />
//                   </span>
//                 </>
//               )}
//             </h1>
//             <p className="mt-2 text-[13px] xl:text-sm text-stone-500 dark:text-stone-400">
//               {isRegister
//                 ? "Start optimizing your resume in seconds"
//                 : "Sign in to analyze and improve your resume"}
//             </p>
//           </div>

//           {/* Registration warning */}
//           {isRegister && (
//             <motion.div
//               initial={{ opacity: 0, y: -4 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-500/20 dark:bg-amber-500/5"
//             >
//               <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
//               <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
//                 <span className="font-semibold">One account per device.</span> Each browser or device can only create one CVCoach account. Creating multiple accounts to bypass usage limits is not allowed and will result in all accounts being suspended.
//               </p>
//             </motion.div>
//           )}

//           {/* Google button */}
//           <motion.button
//             whileHover={{ scale: 1.01 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={handleGoogleLogin}
//             className="w-full inline-flex items-center justify-center px-4 py-2.5 xl:py-3 text-[13px] xl:text-sm font-medium rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-600 transition-colors"
//           >
//             <FcGoogle className="w-5 h-5 mr-2" />
//             Continue with Google
//           </motion.button>

//           {/* Divider */}
//           <div className="my-5 flex items-center gap-3">
//             <span className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
//             <span className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-500">
//               or
//             </span>
//             <span className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <AnimatePresence initial={false}>
//               {isRegister && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: "auto" }}
//                   exit={{ opacity: 0, height: 0 }}
//                   transition={{ duration: 0.25 }}
//                 >
//                   <label className="block text-[11px] xl:text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">
//                     Name
//                   </label>
//                   <div className="relative">
//                     <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
//                     <input
//                       type="text"
//                       name="name"
//                       value={formData.name}
//                       onChange={handleChange}
//                       required
//                       className="w-full pl-9 pr-3 py-2.5 text-[13px] xl:text-sm border border-stone-300 dark:border-stone-700 rounded-xl bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-stone-500 dark:focus:border-stone-500 transition-colors"
//                       placeholder="Enter your name"
//                     />
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             <div>
//               <label className="block text-[11px] xl:text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">
//                 Email
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   required
//                   className="w-full pl-9 pr-3 py-2.5 text-[13px] xl:text-sm border border-stone-300 dark:border-stone-700 rounded-xl bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-stone-500 dark:focus:border-stone-500 transition-colors"
//                   placeholder="Enter your email"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-[11px] xl:text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">
//                 Password
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   required
//                   minLength={6}
//                   className="w-full pl-9 pr-10 py-2.5 text-[13px] xl:text-sm border border-stone-300 dark:border-stone-700 rounded-xl bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-stone-500 dark:focus:border-stone-500 transition-colors"
//                   placeholder="Enter your password"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
//                   aria-label={showPassword ? "Hide password" : "Show password"}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="w-4 h-4" />
//                   ) : (
//                     <Eye className="w-4 h-4" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             <AnimatePresence>
//               {error && (
//                 <motion.p
//                   initial={{ opacity: 0, y: -6 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0 }}
//                   className="text-[11px] text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-3 py-2"
//                 >
//                   {error}
//                 </motion.p>
//               )}
//             </AnimatePresence>

//             <motion.button
//               whileHover={{ scale: 1.01 }}
//               whileTap={{ scale: 0.98 }}
//               type="submit"
//               disabled={loading}
//               className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 xl:py-3 text-[13px] xl:text-sm font-semibold rounded-xl bg-stone-900 dark:bg-lime-300 text-stone-50 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-lime-200 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
//             >
//               {loading ? (
//                 <span className="flex items-center justify-center gap-2">
//                   <Loader2 className="w-4 h-4 animate-spin" />
//                   Loading...
//                 </span>
//               ) : (
//                 <>
//                   {isRegister ? "Create Account" : "Login"}
//                   <LogIn className="w-4 h-4" />
//                 </>
//               )}
//             </motion.button>
//           </form>
//         </div>

//         {/* Toggle mode */}
//         <div className="mt-5 text-center">
//           <p className="text-sm xl:text-base text-stone-600 dark:text-stone-400">
//             {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
//             <button
//               onClick={toggleMode}
//               className="text-stone-900 dark:text-lime-300 hover:underline font-medium"
//             >
//               {isRegister ? "Login" : "Register"}
//             </button>
//           </p>
//         </div>

//         {/* Terms */}
//         <div className="mt-3 text-center">
//           <p className="text-xs xl:text-sm text-stone-400 dark:text-stone-500">
//             By signing in, you agree to our{" "}
//             <a href="#" className="text-stone-600 dark:text-stone-300 hover:underline">
//               Terms of Service
//             </a>{" "}
//             and{" "}
//             <a href="#" className="text-stone-600 dark:text-stone-300 hover:underline">
//               Privacy Policy
//             </a>
//           </p>
//         </div>
//       </motion.div>

//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
//         .font-fraunces { font-family: 'Fraunces', serif; }
//         .font-plex { font-family: 'IBM Plex Sans', sans-serif; }
//       `}</style>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ShieldCheck,
  ScanLine,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "../hooks/redux";
import { login, fetchUser } from "../store/slices/authSlice";
import {
  getLoginRedirect,
  saveRedirectForOAuth,
  consumeRedirect,
} from "../utils/authGuard";
import { getFingerprint } from "../utils/fingerprint";
import api, { setTokens } from "../api/api";

const PROOF_POINTS = [
  "7 free credits, every single day",
  "Scored against the real ATS checks",
  "PDF in, actionable fixes out",
];

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const errCode = searchParams.get("error");
    const reason = searchParams.get("reason");
    if (errCode === "device_blocked") {
      setError(
        reason
          ? decodeURIComponent(reason)
          : "An account already exists on this device. Each device is limited to one account."
      );
      window.history.replaceState({}, "", "/login");
    } else if (errCode === "not_gmail") {
      setError(
        reason
          ? decodeURIComponent(reason)
          : "Only Gmail addresses are accepted for registration."
      );
      window.history.replaceState({}, "", "/login");
    } else if (errCode === "auth_failed") {
      setError("Google sign-in failed. Please try again.");
      window.history.replaceState({}, "", "/login");
    }
  }, [searchParams]);

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
      const payload: any = { ...formData };

      if (isRegister) {
        try {
          payload.fingerprint = await getFingerprint();
        } catch {
          // fingerprint failure should not block registration
        }
      }

      const response = await api.post(endpoint, payload);

      if (response.data.success) {
        const { accessToken, refreshToken } = response.data.data || {};
        if (accessToken && refreshToken) setTokens(accessToken, refreshToken);
        const result = await dispatch(fetchUser());
        const user = result.payload as { role?: string } | null;
        const redirect = getLoginRedirect() || consumeRedirect();
        if (redirect) {
          navigate(redirect, { replace: true });
        } else {
          navigate(user?.role === "admin" ? "/admin-dashboard" : "/", {
            replace: true,
          });
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    saveRedirectForOAuth();
    try {
      const fingerprint = await getFingerprint();
      window.location.href = `${api.defaults.baseURL}/auth/google?fingerprint=${encodeURIComponent(fingerprint)}`;
    } catch {
      dispatch(login());
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError("");
    setFormData({ name: "", email: "", password: "" });
  };

  const inputClass =
    "w-full bg-transparent border-0 border-b border-stone-300 dark:border-stone-700 pl-7 pr-3 py-3 text-[15px] text-stone-900 dark:text-stone-50 placeholder-stone-400 dark:placeholder-stone-600 focus:outline-none focus:border-stone-900 dark:focus:border-lime-300 transition-colors";

  const labelClass =
    "block text-[11px] font-medium uppercase tracking-[0.12em] text-stone-400 dark:text-stone-500 mb-1";

  return (
    <div className="font-plex min-h-screen w-full bg-stone-50 dark:bg-stone-950 lg:grid lg:grid-cols-12">
      {/* ============================================================
       * LEFT — brand panel
       * ==========================================================*/}
      <aside className="relative lg:col-span-5 xl:col-span-5 bg-stone-950 text-stone-50 overflow-hidden px-6 py-2 md:px-10 lg:px-12 xl:px-16 lg:py-14 flex flex-col justify-between">
        {/* dot-grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(250,250,249,0.6) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* soft lime bloom */}
        <div className="pointer-events-none absolute -top-32 -right-24 h-80 w-80 rounded-full bg-lime-400/10 blur-3xl" />

        {/* brand mark */}
        <div className="relative z-10 flex items-center gap-2">
          {/* <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-300 px-3 py-1.5 text-xs font-semibold text-stone-900">
            <ScanLine className="h-3.5 w-3.5" />
            CVCoach
          </span> */}
        </div>

        {/* statement */}
        <div className="relative z-10 my-10 lg:my-0 max-w-md">
          <h2 className="font-fraunces text-3xl leading-[1.12] sm:text-4xl xl:text-[2.9rem]">
            Stop guessing why you
            <br className="hidden sm:block" /> didn't get the{" "}
            <span className="relative inline-block whitespace-nowrap">
              <span className="relative z-10">callback</span>
              <span className="absolute left-0 right-0 bottom-[0.08em] -z-0 h-[0.3em] rounded-[2px] bg-lime-400/80" />
            </span>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-stone-400">
            Run your resume through the same screening logic recruiters use, and
            get the specific fixes that move your score.
          </p>

          <ul className="mt-8 space-y-3.5">
            {PROOF_POINTS.map((point) => (
              <li
                key={point}
                className="flex items-center gap-3 text-sm text-stone-300"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* footer note */}
        <p className="relative z-10 hidden text-xs text-stone-500 lg:block">
          Built for job seekers who'd rather get the interview.
        </p>
      </aside>

      {/* ============================================================
       * RIGHT — form
       * ==========================================================*/}
      <main className="relative lg:col-span-7 xl:col-span-7 flex items-center justify-center px-6 pb-12 pt-4 md:pt-6 xl:pt-32 md:px-10 lg:px-16 xl:px-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md"
        >
          {/* Heading */}
          <div className="mb-9">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-stone-400 dark:text-stone-500">
              {isRegister ? "Get started" : "Sign in"}
            </p>
            <h1 className="font-fraunces mt-3 text-3xl leading-tight text-stone-900 dark:text-stone-50 sm:text-4xl">
              {isRegister ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
              {isRegister
                ? "Start optimizing your resume in seconds."
                : "Sign in to analyze and improve your resume."}
            </p>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-stone-300 bg-white px-4 py-3.5 text-sm font-medium text-stone-800 transition-colors hover:border-stone-900 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-stone-500"
          >
            <FcGoogle className="h-5 w-5" />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="my-7 flex items-center gap-4">
            <span className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
            <span className="text-[10px] uppercase tracking-[0.16em] text-stone-400 dark:text-stone-600">
              or with email
            </span>
            <span className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
          </div>

          {/* Device warning */}
          <AnimatePresence initial={false}>
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mb-7 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 dark:border-amber-500/20 dark:bg-amber-500/5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <p className="text-[11.5px] leading-relaxed text-amber-800 dark:text-amber-300">
                    <span className="font-semibold">One account per device.</span>{" "}
                    Creating multiple accounts to bypass usage limits will result
                    in all accounts being suspended.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence initial={false}>
              {isRegister && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <label className={labelClass}>Name</label>
                  <div className="relative">
                    <User className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-stone-600" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder="Your full name"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className={labelClass}>Email</label>
              <div className="relative">
                <Mail className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-stone-600" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="you@gmail.com"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <Lock className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-stone-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className={`${inputClass} pr-10`}
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-stone-400 transition-colors hover:text-stone-700 dark:text-stone-600 dark:hover:text-stone-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs leading-relaxed text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-3.5 text-sm font-semibold text-stone-50 transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-lime-300 dark:text-stone-900 dark:hover:bg-lime-200"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                <>
                  {isRegister ? "Create account" : "Sign in"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <p className="mt-8 text-sm text-stone-500 dark:text-stone-400">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={toggleMode}
              className="font-medium text-stone-900 underline-offset-4 hover:underline dark:text-lime-300"
            >
              {isRegister ? "Sign in" : "Create one"}
            </button>
          </p>

          {/* Terms */}
          <p className="mt-6 border-t border-stone-200 pt-6 text-xs leading-relaxed text-stone-400 dark:border-stone-800 dark:text-stone-600">
            By continuing, you agree to our{" "}
            <a
              href="#"
              className="text-stone-600 underline-offset-2 hover:underline dark:text-stone-400"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-stone-600 underline-offset-2 hover:underline dark:text-stone-400"
            >
              Privacy Policy
            </a>
            .
          </p>
        </motion.div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        .font-fraunces { font-family: 'Fraunces', serif; }
        .font-plex { font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>
    </div>
  );
}