// /* ===================================
// Hero Upload Box Component
// Uploads a resume and takes the user to the
// ATS Score page with the file pre-loaded.
// =================================== */
// import { useCallback, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import { useDropzone } from "react-dropzone";
// import { Upload, FileUp, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
// import { clsx } from "clsx";

// const MAX_SIZE = 10 * 1024 * 1024;

// export default function HeroUploadBox() {
//   const navigate = useNavigate();
//   const [uploading, setUploading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [fileName, setFileName] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const onDrop = useCallback(
//     (acceptedFiles: File[]) => {
//       const file = acceptedFiles[0];
//       if (!file) return;

//       if (file.size > MAX_SIZE) {
//         setError("File is too large. Maximum size is 10MB.");
//         return;
//       }

//       setError(null);
//       setFileName(file.name);
//       setUploading(true);
//       setProgress(0);

//       const progressInterval = setInterval(() => {
//         setProgress((prev) => Math.min(prev + 25, 90));
//       }, 150);

//       window.setTimeout(() => {
//         clearInterval(progressInterval);
//         setProgress(100);
//         navigate("/ats-scan", {
//           state: { initialResumeFile: file, initialResumeName: file.name },
//         });
//       }, 1200);
//     },
//     [navigate],
//   );

//   const { getRootProps, getInputProps, isDragActive, isDragReject } =
//     useDropzone({
//       onDrop,
//       accept: { "application/pdf": [".pdf"] },
//       maxFiles: 1,
//       maxSize: MAX_SIZE,
//     });

//   return (
//     <motion.div
//       initial={{ opacity: 0, x: 50 }}
//       animate={{ opacity: 1, x: 0 }}
//       transition={{ duration: 0.4, delay: 0.1 }}
//       className="relative"
//     >
//       <div className="bg-white dark:bg-secondary rounded-3xl shadow-md shadow-cyan-500/20 dark:shadow-accent/20 p-8 border border-cyan-200 dark:border-accent">
//         <div className="flex items-center gap-4 mb-6">
//           <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-500 rounded-2xl flex items-center justify-center">
//             <Upload className="w-7 h-7 text-white" />
//           </div>
//           <div>
//             <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Upload Resume</h3>
//             <p className="text-sm text-gray-700 dark:text-gray-300">Get instant ATS score</p>
//           </div>
//         </div>

//         <AnimatePresence mode="wait">
//           {uploading ? (
//             <motion.div
//               key="uploading"
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0 }}
//               className="min-h-[180px] flex flex-col items-center justify-center border-2 border-dashed border-cyan-400 bg-cyan-50 dark:bg-gray-800/50 rounded-2xl p-6"
//             >
//               <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center mb-3">
//                 <Loader2 className="w-7 h-7 text-cyan-600 animate-spin" />
//               </div>
//               <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
//                 Uploading {fileName}
//               </p>
//               <div className="w-full max-w-[200px] h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-4">
//                 <motion.div
//                   className="h-full bg-gradient-to-r from-cyan-500 to-cyan-500 rounded-full"
//                   initial={{ width: 0 }}
//                   animate={{ width: `${progress}%` }}
//                   transition={{ ease: "easeInOut" }}
//                 />
//               </div>
//               <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Preparing ATS analysis...</p>
//             </motion.div>
//           ) : (
//             <motion.div
//               key="upload"
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0 }}
//             >
//               <div
//                 {...getRootProps()}
//                 className={clsx(
//                   "min-h-[180px] flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 cursor-pointer ",
//                   isDragActive
//                     ? "border-cyan-500 bg-cyan-50"
//                     : isDragReject
//                       ? "border-red-400 bg-red-50"
//                       : "border-gray-200 bg-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:bg-primary dark:hover:bg-gray-700/50",
//                 )}
//               >
//                 <input {...getInputProps()} />
//                 <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center mb-3">
//                   <FileUp className="w-6 h-6 text-cyan-600" />
//                 </div>
//                 <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
//                   <span className="font-semibold text-gray-800 dark:text-gray-100">
//                     {isDragActive
//                       ? "Drop your resume here"
//                       : "Click to upload"}
//                   </span>{" "}
//                   or drag and drop
//                 </p>
//                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
//                   PDF only (MAX. 5MB)
//                 </p>
//               </div>
//               {error && (
//                 <p className="flex items-center gap-1 text-xs text-red-600 mt-2">
//                   <AlertCircle className="w-3.5 h-3.5" /> {error}
//                 </p>
//               )}
//             </motion.div>
//           )}
//         </AnimatePresence>

//         <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
//           <CheckCircle className="w-3.5 h-3.5 text-cyan-500" />
//           Free ATS scan · No credit needed
//         </div>
//       </div>
//     </motion.div>
//   );
// }

/* ===================================
Hero Upload Box Component
Uploads a resume and takes the user to the
ATS Score page with the file pre-loaded.
=================================== */
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Upload, FileUp, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { clsx } from "clsx";

const MAX_SIZE = 10 * 1024 * 1024;

export default function HeroUploadBox() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.size > MAX_SIZE) {
        setError("File is too large. Maximum size is 10MB.");
        return;
      }

      setError(null);
      setFileName(file.name);
      setUploading(true);
      setProgress(0);

      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 25, 90));
      }, 150);

      window.setTimeout(() => {
        clearInterval(progressInterval);
        setProgress(100);
        navigate("/ats-scan", {
          state: { initialResumeFile: file, initialResumeName: file.name },
        });
      }, 1200);
    },
    [navigate],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: { "application/pdf": [".pdf"] },
      maxFiles: 1,
      maxSize: MAX_SIZE,
    });

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="font-plex relative"
    >
      <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm p-8 border border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-stone-900 dark:bg-lime-300 rounded-2xl flex items-center justify-center">
            <Upload className="w-7 h-7 text-stone-50 dark:text-stone-900" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-50">Upload resume</h3>
            <p className="text-sm text-stone-600 dark:text-stone-400">Get an instant ATS score</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="min-h-[180px] flex flex-col items-center justify-center border-2 border-dashed border-lime-400 bg-lime-50 dark:bg-stone-800/50 rounded-2xl p-6"
            >
              <div className="w-12 h-12 rounded-full bg-white dark:bg-stone-900 flex items-center justify-center mb-3">
                <Loader2 className="w-7 h-7 text-stone-800 dark:text-lime-300 animate-spin" />
              </div>
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-50">
                Uploading {fileName}
              </p>
              <div className="w-full max-w-[200px] h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden mt-4">
                <motion.div
                  className="h-full bg-lime-400 dark:bg-lime-300 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeInOut" }}
                />
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">Preparing ATS analysis...</p>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div
                {...getRootProps()}
                className={clsx(
                  "min-h-[180px] flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-colors",
                  isDragActive
                    ? "border-lime-400 bg-lime-50 dark:bg-lime-400/10"
                    : isDragReject
                      ? "border-red-400 bg-red-50 dark:bg-red-500/10"
                      : "border-stone-300 bg-stone-50 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800/40 dark:hover:bg-stone-800/70",
                )}
              >
                <input {...getInputProps()} />
                <div className="w-12 h-12 rounded-full bg-lime-100 dark:bg-lime-400/10 flex items-center justify-center mb-3">
                  <FileUp className="w-6 h-6 text-stone-800 dark:text-lime-300" />
                </div>
                <p className="text-sm text-stone-600 dark:text-stone-400 text-center">
                  <span className="font-semibold text-stone-900 dark:text-stone-50">
                    {isDragActive
                      ? "Drop your resume here"
                      : "Click to upload"}
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-2">
                  PDF only (max. 5MB)
                </p>
              </div>
              {error && (
                <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 mt-2">
                  <AlertCircle className="w-3.5 h-3.5" /> {error}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-stone-500 dark:text-stone-400">
          <CheckCircle className="w-3.5 h-3.5 text-lime-500 dark:text-lime-300" />
          Free ATS scan · No credit needed
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        .font-plex { font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>
    </motion.div>
  );
}